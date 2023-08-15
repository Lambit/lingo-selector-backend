const express = require('express');
const UserService = require('./UserService');
//Create a new router instance for user routes
const router = express.Router();
const { check, validationResult } = require('express-validator');
const ValidationErrorException = require('../error/ValidationErrorException');

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

module.exports = router;
