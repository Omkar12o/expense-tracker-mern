const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

async function main() {
  await connectDB();
  const models = [User, Account, Category, Transaction, Budget, Goal];
  for (const model of models) {
    await model.syncIndexes();
    console.log(`Indexes synced: ${model.modelName}`);
  }
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Index sync failed:', error);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  process.exit(1);
});
