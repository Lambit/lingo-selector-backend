const fs = require('fs');
const path = require('path');
const { generateRandomString } = require('../../shared/generator');
const FileType = require('file-type');

// Path for folder
const { uploadDir, profileFolder } = require('../../shared/folderPath');

//Creates a folder named upload if doesn't exist
const createFolder = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder);
  }
};

const saveProfileImage = async (base64File) => {
  const fileName = generateRandomString(32);
  const filePath = path.join(profileFolder, fileName);
  await fs.promises.writeFile(filePath, base64File, 'base64');
  return fileName;
};

const deleteProfileImage = async (fileName) => {
  const filePath = path.join(profileFolder, fileName);
  await fs.promises.unlink(filePath);
};

//Megabyte check
const isLessThan2MB = (buffer) => {
  return buffer.length < 2 * 1024 * 1024;
};

//File type check
const isSupportedFileType = async (buffer) => {
  const type = await FileType.fromBuffer(buffer);
  return !type ? false : type.mime === 'image/png' || type.mime === 'image/jpeg';
};

module.exports = {
  createFolder,
  saveProfileImage,
  deleteProfileImage,
  isLessThan2MB,
  isSupportedFileType,
};
