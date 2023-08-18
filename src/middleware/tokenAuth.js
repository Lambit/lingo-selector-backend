const TokenService = require('../auth/services/TokenService');

/*
    Check incoming request header, and find corresponding user based on jwt token verified
*/
const tokenAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.substring(7);
    try {
      const user = await TokenService.verify(token);
      req.authenticatedUser = user;
    } catch (err) {
      // eslint-disable-next-line prettier/prettier
    }
  }
  next();
};

module.exports = tokenAuth;
