const app = require('../src/app');
const request = require('supertest');
const sequelize = require('../src/config/database');
const bcrypt = require('bcrypt');
const User = require('../src/user/model/User');

//Initialize the database
const syncSequel = () => {
  beforeAll(async () => {
    await sequelize.sync();
  });
};

//Clear database of test created users
const clearBefore = () => {
  beforeEach(async () => {
    await User.destroy({ truncate: { cascade: true } });
  });
};

//Test user object
const activeUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
  inactive: false,
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

module.exports = {
  syncSequel,
  clearBefore,
  activeUser,
  getUsers,
  getUser,
  incrementUser,
  addUser,
};
