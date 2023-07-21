const mongoose = require('mongoose');
const { Product } = require('../../src/database');
const {
  userOne, userTwo,
} = require('./user.fixture');

const productOneUserOne = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Audi A3',
  description: 'Sportback S line 30 TDI 85kW S tronic',
  category: 'Audi',
  price: 765,
  userId: userOne._id,
};

const productTwoUserTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Bmw X1',
  description: 'xDrive25e',
  category: 'Bmw',
  price: 955,
  userId: userTwo._id,
};

const insertProducts = async (products) => {
  await Product.insertMany(products.map((product) => ({ ...product })));
};

module.exports = {
  productOneUserOne,
  productTwoUserTwo,
  insertProducts,
};
