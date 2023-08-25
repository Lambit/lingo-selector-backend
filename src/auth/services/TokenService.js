const { generateRandomString } = require('../../shared/generator');
const Token = require('../model/Token');
const Sequelize = require('sequelize');

/*
    Create a random string with the generateRandomString function. 
    Save it to database calling the Token model.

    Token : {
      token: token,
      userId: user.id (foreignKey),
      lastUsedAt: new Date(),
    }
    
    Used to Authorize user in AuthRouter.
*/

//One Weeks Time
const oneWeek = 7 * 24 * 60 * 60 * 1000;

const createToken = async (user) => {
  const token = generateRandomString(32);
  await Token.create({
    token: token,
    userId: user.id,
    lastUsedAt: new Date(),
  });
  return token;
};

//Verify that credentials match for specific user.
const verify = async (token) => {
  const weekOld = new Date(Date.now() - oneWeek);
  const savedToken = await Token.findOne({
    where: {
      token: token,
      lastUsedAt: {
        [Sequelize.Op.gt]: weekOld,
      },
    },
  });
  savedToken.lastUsedAt = new Date();
  await savedToken.save();
  const userId = savedToken.userId;
  return { id: userId };
};

const deleteToken = async (token) => {
  await Token.destroy({ where: { token: token } });
};

//deletes all tokens related to the user, identified by their id
const deleteMultipleTokens = async (userId) => {
  await Token.destroy({ where: { userId: userId } });
};

//Delete expired tokens in database every hour
const scheduleCleanup = () => {
  setInterval(
    async () => {
      const oneWeekAgo = new Date(Date.now() - oneWeek);
      await Token.destroy({
        where: {
          lastUsedAt: {
            [Sequelize.Op.lt]: oneWeekAgo,
          },
        },
      });
    },
    60 * 60 * 1000,
  );
};

module.exports = { createToken, verify, deleteToken, deleteMultipleTokens, scheduleCleanup };
