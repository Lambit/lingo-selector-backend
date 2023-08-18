const Sequelize = require('sequelize');
const sequelize = require('../../config/database');
const Token = require('../../auth/model/Token');

const Model = Sequelize.Model;

class User extends Model {}

//First object is the attributes of the model, second is the options
User.init(
  {
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    inactive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    activationToken: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    modelName: 'user',
  },
);

/*
  User has multiple tokens, whenever user is deleted, Token table is effected by these options
    onDelete: deletes all tokens tied to user,
    foreignKey: Token table uses the id from user table 
*/
User.hasMany(Token, { onDelete: 'cascade', foreignKey: 'userId' });

module.exports = User;
