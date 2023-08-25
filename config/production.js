module.exports = {
  database: {
    database: 'lingo',
    username: 'my-db-user',
    password: 'db-pass',
    dialect: 'sqlite',
    storage: './production.sqlite',
    logging: false,
  },
  mail: {
    service: 'gmail',
    auth: {
      user: 'luke.lamb.audio@gmail.com',
      pass: '',
    },
  },
  uploadDir: 'uploads-prod',
  profileDir: 'profile',
};
