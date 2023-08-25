const fs = require('fs');
const path = require('path');
const { uploadDir, profileDir } = require('../src/shared/folderPath');
const FileService = require('../src/user/services/FileService');

describe('Folder Creation', () => {
  //Upload folder creation
  it('creates upload folder', () => {
    FileService.createFolder();
    expect(fs.existsSync(uploadDir)).toBe(true);
  });
  //Profile folder creation
  it('creates upload folder', () => {
    FileService.createFolder();
    const folder = path.join('.', uploadDir, profileDir);
    expect(fs.existsSync(folder)).toBe(true);
  });
});

// describe('File Type', () => {
//   /*
//     File Type Check Tests ----Create a table with files and status codes
//   */

//   it.each`
//     file              | status
//     ${'test-gif.gif'} | ${400}
//   `('returns $status when uploading $file as image', async ({ file, status }) => {
//     const read64File = base64File(file);
//     const savedUser = await addUser();
//     const bodyUpdate = { username: 'user2128', image: read64File };
//     const response = await putUser(savedUser.id, bodyUpdate, {
//       auth: { email: savedUser.email, password: 'P4ssword' },
//     });
//     expect(response.status).toBe(status);
//   });
// });
