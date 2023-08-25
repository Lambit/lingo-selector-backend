module.exports = {
  database: {
    database: 'lingo',
    username: 'my-db-user',
    password: 'db-pass',
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  mail: {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'anna.gerhold51@ethereal.email',
      pass: 'xSXQMPTMx9kXFkeaKe',
    },
  },
  uploadDir: 'uploads-test',
  profileDir: 'profile-test',
};
