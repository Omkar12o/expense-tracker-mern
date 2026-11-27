const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.valid.body);
    return sendSuccess(res, result, { status: 201, message: 'Account created successfully.' });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.valid.body);
    return sendSuccess(res, result, { message: 'Signed in successfully.' });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.me(req.user._id);
    return sendSuccess(res, { user });
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  return sendSuccess(res, authService.logout());
}

module.exports = { register, login, me, logout };
