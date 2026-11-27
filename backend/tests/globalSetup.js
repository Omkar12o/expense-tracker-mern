const fs = require('fs');
const os = require('os');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  const uriFile = path.join(os.tmpdir(), 'expense-tracker-mongo-uri.txt');

  fs.writeFileSync(uriFile, mongod.getUri(), 'utf8');
  process.env.MONGO_URI_FILE = uriFile;
  global.__MONGO_MEMORY_SERVER__ = mongod;
};
