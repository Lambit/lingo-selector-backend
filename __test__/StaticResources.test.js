const app = require('../src/app');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const { profileFolder } = require('../src/shared/folderPath');

describe('Profile Image', () => {
  //Function to that returns stored files
  const copyStoredFile = () => {
    const filePath = path.join('.', '__test__', 'assets', 'hi-yall.png');
    const fileName = 'test-file';
    const targetPath = path.join(profileFolder, fileName);
    fs.copyFileSync(filePath, targetPath);
    return fileName;
  };

  //404 no file
  it('returns 404 when not found.', async () => {
    const response = await request(app).get('/images/1222333');
    expect(response.status).toBe(404);
  });

  //200 file exists
  it('returns 200 ok when file exists', async () => {
    const copyfileName = copyStoredFile();
    const response = await request(app).get('/images/' + copyfileName);
    expect(response.status).toBe(200);
  });

  //Check cache-control in headers to be equivalent to one years time
  it('returns cache for 1 year in response', async () => {
    const copyfileName = copyStoredFile();
    const response = await request(app).get('/images/' + copyfileName);
    const year = 365 * 24 * 60 * 60;
    expect(response.header['cache-control']).toContain(`max-age=${year}`);
  });
});
