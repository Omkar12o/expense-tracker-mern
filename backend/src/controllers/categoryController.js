const categoryService = require('../services/categoryService');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const categories = await categoryService.list(req.user._id);
    return sendSuccess(res, categories);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const category = await categoryService.create(req.user._id, req.valid.body);
    return sendSuccess(res, { category }, { status: 201, message: 'Category created.' });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const result = await categoryService.remove(req.user._id, req.valid.params.id);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, remove };
