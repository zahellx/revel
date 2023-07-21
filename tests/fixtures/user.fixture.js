const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { User } = require('../../src/database');

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Angel',
  email: 'angel@example.com',
  password,
  role: 'user',
};

const userTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Ines',
  email: 'ines@example.com',
  password,
  role: 'user',
};

const admin = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Admin',
  email: 'admin@example.com',
  password,
  role: 'admin',
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

module.exports = {
  userOne,
  userTwo,
  admin,
  insertUsers,
};
