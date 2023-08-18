const crypto = require('crypto');

/*
    Generate random string for user token.
*/
const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

module.exports = { generateRandomString };
