const logger = require('../shared/logger');

const sendAccountActivation = async (email, token) => {
  const url = `http://localhost:3021/activate/${token}`;
  logger.info(url);
};

const passwordResetEmail = async (email, token) => {
  const url = `http://localhost:3021/password-reset/${token}`;
  logger.info(url);
};

module.exports = { sendAccountActivation, passwordResetEmail };
