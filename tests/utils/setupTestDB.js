const mongoose = require('mongoose');
const config = require('config');

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.get('database').url, config.get('database').options);
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

module.exports = setupTestDB;
