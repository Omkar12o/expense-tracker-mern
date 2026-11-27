const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');
const { BUILTIN_CATEGORIES } = require('../utils/constants');
const { escapeRegex } = require('../utils/text');

const COLLATION = { locale: 'en', strength: 2 };

async function iconMap(userId) {
  const custom = await Category.find({ user: userId }).select('name type icon').lean();
  const map = new Map();
  for (const type of ['income', 'expense']) {
    for (const item of BUILTIN_CATEGORIES[type]) {
      map.set(`${type}:${item.name.toLowerCase()}`, item.icon);
    }
  }
  for (const item of custom) map.set(`${item.type}:${item.name.toLowerCase()}`, item.icon);
  return map;
}

async function list(userId) {
  const custom = await Category.find({ user: userId }).lean();
  const byType = (type) => {
    const builtIns = BUILTIN_CATEGORIES[type].map((item) => ({
      ...item,
      type,
      custom: false,
      builtIn: true,
    }));
    const customItems = custom
      .filter((item) => item.type === type)
      .map((item) => ({
        id: item._id.toString(),
        name: item.name,
        icon: item.icon,
        type,
        custom: true,
        builtIn: false,
      }));
    return [...builtIns, ...customItems].sort((a, b) => a.name.localeCompare(b.name));
  };

  return { expense: byType('expense'), income: byType('income') };
}

async function resolve(userId, type, name) {
  const target = String(name).trim();
  const builtIn = BUILTIN_CATEGORIES[type].find(
    (item) => item.name.toLowerCase() === target.toLowerCase(),
  );
  if (builtIn) return { name: builtIn.name, icon: builtIn.icon, custom: false };

  const custom = await Category.findOne({ user: userId, type, name: target })
    .collation(COLLATION)
    .lean();
  if (!custom) {
    throw AppError.badRequest(`"${target}" is not a valid ${type} category.`, 'INVALID_CATEGORY');
  }
  return { name: custom.name, icon: custom.icon, custom: true };
}

async function create(userId, input) {
  const name = input.name.trim();
  const builtIn = BUILTIN_CATEGORIES[input.type].find(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );
  if (builtIn) {
    throw AppError.conflict('A built-in category already uses this name.', 'BUILTIN_CATEGORY');
  }

  const existing = await Category.findOne({ user: userId, type: input.type, name })
    .collation(COLLATION)
    .lean();
  if (existing) {
    throw AppError.conflict('You already have a category with this name.', 'CATEGORY_EXISTS');
  }

  const category = await Category.create({ user: userId, name, type: input.type, icon: input.icon });
  return {
    id: category._id.toString(),
    name: category.name,
    icon: category.icon,
    type: category.type,
    custom: true,
    builtIn: false,
  };
}

async function remove(userId, id) {
  const category = await Category.findOne({ _id: id, user: userId });
  if (!category) throw AppError.notFound('Category not found.', 'CATEGORY_NOT_FOUND');

  const used = await Transaction.exists({
    user: userId,
    type: category.type,
    category: new RegExp(`^${escapeRegex(category.name)}$`, 'i'),
  });
  if (used) {
    throw AppError.conflict('This category is used by existing transactions.', 'CATEGORY_IN_USE');
  }

  await category.deleteOne();
  return { message: 'Category deleted.' };
}

module.exports = { list, resolve, create, remove, iconMap };
