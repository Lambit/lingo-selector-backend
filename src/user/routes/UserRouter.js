const express = require('express');
const UserService = require('../services/UserService');
//Create a new router instance for user routes
const router = express.Router();
const { check, validationResult } = require('express-validator');
const ValidationErrorException = require('../../error/ValidationErrorException');
const ForbiddenException = require('../../error/ForbiddenException');
const pagination = require('../../middleware/pagination');
const FileService = require('../services/FileService');

/*
    UserRouter hold the user routes for our API post request that uses the save function
    created in the UserService module store and hash user data.
*/

//Post request uses middleware function from express-validation if passes stores user returns message.
router.post(
  '/api/users',
  //username check, conditions and message
  check('username')
    .notEmpty()
    .withMessage('username_null')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('username_size'),
  //email check, conditions and message
  check('email')
    .notEmpty()
    .withMessage('email_null')
    .bail()
    .isEmail()
    .withMessage('email_invalid')
    .bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);
      if (user) {
        throw new Error('email_inuse');
      }
    }),
  //password check, conditions and message
  check('password')
    .notEmpty()
    .withMessage('password_null')
    .bail()
    .isLength({ min: 6 })
    .withMessage('password_size')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('password_pattern'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationErrorException(errors.array()));
    }
    try {
      await UserService.save(req.body);
      return res.send({ message: req.t('user_create_success') });
    } catch (err) {
      next(err);
    }
  },
);

/*
  Route for activating a users account setting the token to a variable,
  using the activate function imported from UserService, activates account.
  Error handling with specific language choses.
*/
router.post('/api/users/token/:token', async (req, res, next) => {
  const token = req.params.token;
  try {
    await UserService.activate(token);
    return res.send({ message: req.t('account_activation_success') });
  } catch (err) {
    next(err);
  }
});

//Get route ----- User list route get all users limits the amount with pagination middleware
router.get('/api/users', pagination, async (req, res, next) => {
  try {
    const { page, size } = req.pagination;
    const users = await UserService.getUsers(page, size);
    return res.send(users);
  } catch (err) {
    next(err);
  }
});

//Get route ----- User by id route get
router.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.send(user);
  } catch (err) {
    next(err);
  }
});

//Put route ----- Update user - if id doesnt match return error response other wise valid, if updated validation check as well
router.put(
  '/api/users/:id',
  //username check, conditions and message
  check('username')
    .notEmpty()
    .withMessage('username_null')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('username_size'),
  check('image').custom(async (imageAsBase64String) => {
    if (!imageAsBase64String) {
      return true;
    }
    const buffer = Buffer.from(imageAsBase64String, 'base64');
    if (!FileService.isLessThan2MB(buffer)) {
      throw new Error('profile_image_size');
    }

    const supportedType = await FileService.isSupportedFileType(buffer);
    if (!supportedType) {
      throw new Error('unsupported_image_file');
    }

    return true;
  }),
  async (req, res, next) => {
    const authenticatedUser = req.authenticatedUser;
    if (!authenticatedUser || authenticatedUser.id !== req.params.id) {
      return next(new ForbiddenException('unauth_update'));
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationErrorException(errors.array()));
    }
    const user = await UserService.updateUser(req.params.id, req.body);
    return res.send(user);
  },
);

//Delete route ----- Delete user
router.delete('/api/users/:id', async (req, res, next) => {
  const authenticatedUser = req.authenticatedUser;
  if (!authenticatedUser || authenticatedUser.id !== req.params.id) {
    return next(new ForbiddenException('unauth_delete'));
  }
  await UserService.deleteUser(req.params.id);
  res.send();
});

//Post route ----- Password reset
router.post('/api/user/password', check('email').isEmail().withMessage('email_invalid'), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationErrorException(errors.array()));
  }
  try {
    await UserService.resetPassword(req.body.email);
    return res.send({ message: req.t('password_reset_success') });
  } catch (err) {
    next(err);
  }
});

const passwordResetTokenValidator = async (req, res, next) => {
  const user = await UserService.findByPasswordResetToken(req.body.passwordResetToken);
  if (!user) {
    return next(new ForbiddenException('password_reset_fail'));
  }
  next();
};

router.put(
  '/api/user/password',
  passwordResetTokenValidator,
  check('password')
    .notEmpty()
    .withMessage('password_null')
    .bail()
    .isLength({ min: 6 })
    .withMessage('password_size')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('password_pattern'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationErrorException(errors.array()));
    }
    await UserService.updatePassword(req.body);
    res.send();
  },
);

module.exports = router;
