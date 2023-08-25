const app = require('../src/app');
const request = require('supertest');
const sequelize = require('../src/config/database');
const bcrypt = require('bcrypt');
const User = require('../src/user/model/User');
const fs = require('fs');
const path = require('path');

//Initialize the database
const syncSequel = () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV === 'test') {
      await sequelize.sync();
    }
  });
};

//Clear database of test created users
const clearBefore = () => {
  beforeEach(async () => {
    await User.destroy({ truncate: { cascade: true } });
  });
};

const filePath = path.join('.', '__test__', 'assets', 'hi-yall.png');
const in64 = fs.readFileSync(filePath, { encoding: 'base64' });

//Test user object
const activeUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
  inactive: false,
  image: in64,
};

//get route for users
const getUsers = () => {
  return request(app).get('/api/users');
};
//get route for users by id
const getUser = (id = 5) => {
  return request(app).get('/api/users/' + id);
};

//Loop through count and return an object with user data incrementing by 1
const incrementUser = async (activeCount, inactiveCount = 0) => {
  for (let i = 0; i < activeCount + inactiveCount; i++) {
    await User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@mail.com`,
      inactive: i > activeCount,
    });
  }
};

//Hashes password saves user to database
const addUser = async (user = { ...activeUser }) => {
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  return await User.create(user);
};

//Read file path for images as base64
const base64File = (file = 'hi-yall.png') => {
  const filePath = path.join('.', '__test__', 'assets', file);
  return fs.readFileSync(filePath, { encoding: 'base64' });
};

module.exports = {
  syncSequel,
  clearBefore,
  activeUser,
  getUsers,
  getUser,
  incrementUser,
  addUser,
  in64,
  base64File,
};
