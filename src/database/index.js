const mongoose = require('mongoose');
const config = require('config');
const User = require('./models/user');
const Product = require('./models/product');
const Token = require('./models/token');

const initDatabase = async () => {
  await mongoose.connect(config.get('database').url);
};

module.exports = {
  initDatabase,
  User,
  Product,
  Token,
};
