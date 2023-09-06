const app = require('./src/app');
const sequelize = require('./src/config/database');
const TokenService = require('./src/auth/services/TokenService');
const logger = require('./src/shared/logger');
const bcrypt = require('bcrypt');
const User = require('./src/user/model/User');

//Sync new database created.
sequelize.sync();

//Clean up tokens in database accordingly
TokenService.scheduleCleanup();

const addUser = async (index) => {
  const hash = await bcrypt.hash('P4ssword', 10);
  const user = {
    username: `user${index}`,
    email: `user${index}@mail.com`,
    password: hash,
    inactive: false,
  };
  await User.create(user);
};

const add = async () => {
  if (process.env.NODE_ENV === 'development') {
    for (let i = 1; i <= 25; i++) {
      await addUser(i);
    }
  }
};

add();

app.listen(process.env.PORT || 3000, () => logger.info('app is running. version: ' + process.env.npm_package_version));
