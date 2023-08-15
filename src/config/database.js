const Sequelize = require('sequelize');
const config = require('config');

/*
  Multiple databases created with json files by using config.get() 
  which database to be used will be determined through the command line.
*/
const configDb = config.get('database');

//Instance of new database created and turned to a variable.
const sequelize = new Sequelize(configDb.database, configDb.username, configDb.password, {
  dialect: configDb.dialect,
  storage: configDb.storage,
  logging: configDb.logging,
});

module.exports = sequelize;
