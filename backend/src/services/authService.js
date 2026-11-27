const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const User = require('../models/User');
const Account = require('../models/Account');
const AppError = require('../utils/AppError');
const { DEFAULT_ACCOUNTS } = require('../utils/constants');

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-for-timing-only', 4);

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), type: 'access' },
    env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN },
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
  };
}

async function register(input) {
  const email = input.email.toLowerCase();
  const username = input.username.toLowerCase();
  const [emailExists, usernameExists] = await Promise.all([
    User.exists({ email }),
    User.exists({ username }),
  ]);
  if (emailExists) {
    throw AppError.conflict('An account with this email already exists.', 'EMAIL_IN_USE');
  }
  if (usernameExists) {
    throw AppError.conflict('An account with this username already exists.', 'USERNAME_IN_USE');
  }

  let user;
  try {
    user = await User.create({ name: input.name, username, email, password: input.password });
  } catch (error) {
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === 'username') {
        throw AppError.conflict('An account with this username already exists.', 'USERNAME_IN_USE');
      }
      throw AppError.conflict('An account with this email already exists.', 'EMAIL_IN_USE');
    }
    throw error;
  }

  await Account.insertMany(
    DEFAULT_ACCOUNTS.map((account) => ({
      user: user._id,
      name: account.name,
      type: account.type,
      initialBalance: 0,
    })),
  );

  return { user: publicUser(user), token: signToken(user) };
}

async function login(input) {
  const identifier = String(input.username || input.email || '').trim().toLowerCase();
  const query = identifier.includes('@') ? { email: identifier } : { username: identifier };
  const user = await User.findOne(query).select('+password');
  const validPassword = await bcrypt.compare(input.password, user ? user.password : DUMMY_HASH);

  if (!user || !validPassword) {
    throw AppError.unauthorized('Invalid username or password.', 'INVALID_CREDENTIALS');
  }

  return { user: publicUser(user), token: signToken(user) };
}

async function me(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.unauthorized('This account no longer exists.', 'INVALID_TOKEN');
  }
  return publicUser(user);
}

function logout() {
  return { message: 'Signed out. Discard the token on this device.' };
}

module.exports = { register, login, me, logout, publicUser, signToken };
