const transactionService = require('../services/transactionService');
const { sendSuccess } = require('../utils/response');
const { todayUTC } = require('../utils/dates');

async function list(req, res, next) {
  try {
    const result = await transactionService.list(req.user._id, req.valid.query);
    return sendSuccess(res, result.items, {
      pagination: result.pagination,
      summary: result.summary,
    });
  } catch (error) {
    return next(error);
  }
}

async function exportCsv(req, res, next) {
  try {
    await transactionService.exportCsv(req.user._id, req.valid.query, res);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const transaction = await transactionService.getById(req.user._id, req.valid.params.id);
    return sendSuccess(res, { transaction });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const body = { date: todayUTC(), ...req.valid.body };
    const transaction = await transactionService.create(req.user._id, body);
    return sendSuccess(res, { transaction }, { status: 201, message: 'Transaction created.' });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const transaction = await transactionService.update(
      req.user._id,
      req.valid.params.id,
      req.valid.body,
    );
    return sendSuccess(res, { transaction }, { message: 'Transaction updated.' });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    await transactionService.remove(req.user._id, req.valid.params.id);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, exportCsv, getById, create, update, remove };
