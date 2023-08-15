/* eslint-disable no-unused-vars */
module.exports = (err, req, res, next) => {
  const { status, message, errors } = err;
  let validationErrors;
  if (errors) {
    validationErrors = {};
    //Loop over error path and convert it to message in empty object
    errors.forEach((error) => (validationErrors[error.path] = req.t(error.msg)));
  }
  res
    .status(status)
    .send({ path: req.originalUrl, timestamp: new Date().getTime(), message: req.t(message), validationErrors });
};
