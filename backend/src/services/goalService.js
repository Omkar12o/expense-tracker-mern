const Goal = require('../models/Goal');
const AppError = require('../utils/AppError');
const { startOfUTCDay } = require('../utils/dates');
const { roundMoney } = require('../utils/text');

async function findOwned(userId, id) {
  const goal = await Goal.findOne({ _id: id, user: userId });
  if (!goal) throw AppError.notFound('Goal not found.', 'GOAL_NOT_FOUND');
  return goal;
}

async function list(userId) {
  return Goal.find({ user: userId }).sort({ createdAt: -1 });
}

async function create(userId, input) {
  return Goal.create({
    user: userId,
    name: input.name.trim(),
    targetAmount: input.targetAmount,
    currentAmount: input.currentAmount ?? 0,
    targetDate: input.targetDate ? startOfUTCDay(input.targetDate) : null,
  });
}

async function update(userId, id, patch) {
  const goal = await findOwned(userId, id);
  if (patch.name !== undefined) goal.name = patch.name.trim();
  if (patch.targetAmount !== undefined) goal.targetAmount = patch.targetAmount;
  if (patch.targetDate !== undefined) {
    goal.targetDate = patch.targetDate ? startOfUTCDay(patch.targetDate) : null;
  }
  await goal.save();
  return goal;
}

async function contribute(userId, id, amount) {
  const goal = await findOwned(userId, id);
  const next = roundMoney(goal.currentAmount + amount);
  if (next < 0) {
    throw AppError.badRequest('Goal savings cannot go below zero.', 'INSUFFICIENT_FUNDS');
  }
  goal.currentAmount = next;
  await goal.save();
  return goal;
}

async function remove(userId, id) {
  const goal = await findOwned(userId, id);
  await goal.deleteOne();
  return { message: 'Goal deleted.' };
}

module.exports = { list, create, update, contribute, remove };
