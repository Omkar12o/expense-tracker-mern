const goalService = require('../services/goalService');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const goals = await goalService.list(req.user._id);
    return sendSuccess(res, goals);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const goal = await goalService.create(req.user._id, req.valid.body);
    return sendSuccess(res, { goal }, { status: 201, message: 'Goal created.' });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const goal = await goalService.update(req.user._id, req.valid.params.id, req.valid.body);
    return sendSuccess(res, { goal }, { message: 'Goal updated.' });
  } catch (error) {
    return next(error);
  }
}

async function contribute(req, res, next) {
  try {
    const goal = await goalService.contribute(
      req.user._id,
      req.valid.params.id,
      req.valid.body.amount,
    );
    return sendSuccess(res, { goal }, { message: 'Goal updated.' });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const result = await goalService.remove(req.user._id, req.valid.params.id);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, update, contribute, remove };
