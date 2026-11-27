const mongoose = require('mongoose');
const app = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');

const server = app.listen(env.PORT, () => {
  console.log(`Expense Tracker API listening on port ${env.PORT}`);
});

connectDB()
  .then(() => console.log('MongoDB connected.'))
  .catch((error) => {
    console.error('MongoDB connection failed. API routes will return errors until it is restored:', error.message);
  });

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down.`);
  server.close(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
