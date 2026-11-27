const mongoose = require('mongoose');
const { env } = require('../config/env');
const { connectDB } = require('../config/db');
const { maskMongoUri, safeMongoError } = require('../utils/mongoUri');

async function main() {
  console.log(`Checking MongoDB connection to ${maskMongoUri(env.MONGO_URI)}`);

  const connection = await connectDB();
  const database = connection.db;
  const collections = (await database.listCollections().toArray())
    .map((item) => item.name)
    .filter((name) => !name.startsWith('system.'))
    .sort();
  const users = await database.collection('users').countDocuments();

  console.log('MongoDB connection successful.');
  console.log(`Database: ${database.databaseName}`);
  console.log(`Collections: ${collections.length ? collections.join(', ') : '<none yet>'}`);
  console.log(`Users: ${users}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(`MongoDB connection failed: ${safeMongoError(error, env.MONGO_URI)}`);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  process.exit(1);
});
