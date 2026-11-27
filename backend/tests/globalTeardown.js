const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = async function globalTeardown() {
  if (global.__MONGO_MEMORY_SERVER__) {
    await global.__MONGO_MEMORY_SERVER__.stop();
  }
  fs.rmSync(path.join(os.tmpdir(), 'expense-tracker-mongo-uri.txt'), { force: true });
};
