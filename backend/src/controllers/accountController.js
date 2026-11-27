const accountService = require('../services/accountService');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const result = await accountService.list(req.user._id);
    return sendSuccess(res, result.items, { total: result.total });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const input = { initialBalance: 0, ...req.valid.body };
    const account = await accountService.create(req.user._id, input);
    return sendSuccess(res, { account }, { status: 201, message: 'Account created.' });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const account = await accountService.update(
      req.user._id,
      req.valid.params.id,
      req.valid.body,
    );
    return sendSuccess(res, { account }, { message: 'Account updated.' });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const result = await accountService.remove(req.user._id, req.valid.params.id);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, update, remove };
