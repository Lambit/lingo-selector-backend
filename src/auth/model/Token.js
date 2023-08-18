const Sequelize = require('sequelize');
const sequelize = require('../../config/database');

const Model = Sequelize.Model;

class Token extends Model {}

//First object is the attributes of the model, second is the options
Token.init(
  {
    token: {
      type: Sequelize.STRING,
    },
    lastUsedAt: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: 'token',
    timestamps: false,
  },
);
module.exports = Token;
