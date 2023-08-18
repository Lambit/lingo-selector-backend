const User = require('../model/User');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const sequelize = require('../../config/database');
const EmailService = require('../../email/EmailService');
const EmailException = require('../../email/EmailExceptions');
const InvalidTokenException = require('../error/InvalidTokenException');
const NotFoundException = require('../../error/NotFoundException');
const { generateRandomString } = require('../../shared/generator');
const TokenService = require('../../auth/services/TokenService');
/*
    UserService holds the business service of the application such as 
    hashing and saving data for users. The save function does so.
*/

const save = async (body) => {
  const { username, email, password } = body;
  const hash = await bcrypt.hash(password, 10);
  const user = { username, email, password: hash, activationToken: generateRandomString(16) };
  const transaction = await sequelize.transaction();
  await User.create(user, { transaction });
  try {
    await EmailService.sendAccountActivation(email, user.activationToken);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new EmailException();
  }
};

//Find user in database by specific email
const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

//Query users token and initially set to inactive then save it to activate
const activate = async (token) => {
  const user = await User.findOne({ where: { activationToken: token } });
  if (!user) {
    throw new InvalidTokenException();
  }
  user.inactive = false;
  user.activationToken = null;
  await user.save();
};

//Use pagination to get page and size of specified user list
const getUsers = async (page, size, authenticatedUser) => {
  const usersCount = await User.findAndCountAll({
    where: {
      inactive: false,
      id: {
        [Sequelize.Op.not]: authenticatedUser ? authenticatedUser.id : 0,
      },
    },
    limit: size,
    offset: page * size,
    attributes: ['id', 'username', 'email'],
  });
  return {
    content: usersCount.rows,
    page,
    size,
    totalPages: Math.ceil(usersCount.count / size),
  };
};

//Use pagination to get page and size of specified user list
const getUserById = async (id) => {
  const user = await User.findOne({
    where: {
      id: id,
      inactive: false,
    },
    attributes: ['id', 'username', 'email'],
  });
  if (!user) {
    throw new NotFoundException('user_not_found');
  }
  return user;
};

//Update user by id with request.body payload on utilized in UserRouter put request
const updateUser = async (id, updateBody) => {
  const user = await User.findOne({
    where: {
      id: id,
    },
  });
  user.username = updateBody.username;
  await user.save();
  return {
    id: id,
    username: user.username,
    email: user.email,
  };
};

const deleteUser = async (id) => {
  await User.destroy({ where: { id: id } });
  await TokenService.deleteMultipleTokens(id);
};

const resetPassword = async (email) => {
  const user = await findByEmail(email);
  if (!user) {
    throw new NotFoundException('email_not_inuse');
  }
  user.passwordResetToken = generateRandomString(16);
  await user.save();
  try {
    await EmailService.passwordResetEmail(email, user.passwordResetToken);
  } catch (err) {
    throw new EmailException();
  }
};

module.exports = { save, findByEmail, activate, getUsers, getUserById, updateUser, deleteUser, resetPassword };
