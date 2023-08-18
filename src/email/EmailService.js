const transporter = require('../config/emailTransporter');
const logger = require('../shared/logger');

const sendAccountActivation = async (email, token) => {
  await transporter.sendMail({
    from: 'My App <info2my-app.com>',
    to: email,
    subject: 'Account Activation',
    html: `Token is ${token}`,
  });
};

const passwordResetEmail = async (email, token) => {
  const url = `http://localhost:3000/password-reset/${token}`;
  logger.info(url);
};

module.exports = { sendAccountActivation, passwordResetEmail };
