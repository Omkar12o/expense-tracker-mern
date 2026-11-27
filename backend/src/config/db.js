const mongoose = require('mongoose');
const { env } = require('./env');

mongoose.set('bufferCommands', false);

function dbOptions() {
  return {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 5,
  };
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!globalThis.__expenseTrackerDb) {
    globalThis.__expenseTrackerDb = { conn: null, promise: null };
  }

  if (globalThis.__expenseTrackerDb.promise) {
    return globalThis.__expenseTrackerDb.promise;
  }

  const promise = mongoose
    .connect(env.MONGO_URI, dbOptions())
    .then((instance) => {
      globalThis.__expenseTrackerDb.conn = instance.connection;
      return instance.connection;
    })
    .catch((error) => {
      globalThis.__expenseTrackerDb.promise = null;
      throw error;
    });

  globalThis.__expenseTrackerDb.promise = promise;
  return promise;
}

function clearConnectionCache() {
  globalThis.__expenseTrackerDb = null;
}

module.exports = { connectDB, clearConnectionCache, dbOptions };
