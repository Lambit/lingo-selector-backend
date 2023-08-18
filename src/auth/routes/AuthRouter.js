const express = require('express');
const router = express.Router();
const UserService = require('../../user/services/UserService');
const AuthException = require('../error/AuthException');
const ForbiddenException = require('../../error/ForbiddenException');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const TokenService = require('../services/TokenService');

router.post('/api/auth', check('email').isEmail(), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AuthException());
  }
  const { email, password } = req.body;
  const user = await UserService.findByEmail(email);
  if (!user) {
    return next(new AuthException());
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return next(new AuthException());
  }
  if (user.inactive) {
    return next(new ForbiddenException());
  }

  const token = await TokenService.createToken(user);

  res.send({
    id: user.id,
    username: user.username,
    token,
  });
});

//Post Route ---- Logout /api/logout
router.post('/api/logout', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.substring(7);
    await TokenService.deleteToken(token);
  }
  res.send();
});

module.exports = router;
