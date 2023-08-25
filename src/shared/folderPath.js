const path = require('path');
const config = require('config');

//Created Folders
const { uploadDir, profileDir } = config;
// Path for folder
const profileFolder = path.join('.', uploadDir, profileDir);

const MILLI_YEAR = 365 * 24 * 60 * 60 * 1000;

module.exports = {
  uploadDir,
  profileDir,
  profileFolder,
  MILLI_YEAR,
};
