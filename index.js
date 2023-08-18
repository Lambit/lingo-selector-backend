const app = require('./src/app');
const sequelize = require('./src/config/database');
const User = require('./src/user/model/User');
const bcrypt = require('bcrypt');
const TokenService = require('./src/auth/services/TokenService');

//Loop through count and return an object with user data incrementing by 1
const addUsers = async (activeCount, inactiveCount = 0) => {
  const hash = await bcrypt.hash('P4ssword', 10);
  for (let i = 0; i < activeCount + inactiveCount; i++) {
    await User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@mail.com`,
      inactive: i > activeCount,
      password: hash,
    });
  }
};

//Sync new database created.
sequelize.sync({ force: true }).then(async () => {
  await addUsers(25);
});

//Clean up tokens in database accordingly
TokenService.scheduleCleanup();

app.listen(3000, () => console.log('app is running on PORT: 3000'));
