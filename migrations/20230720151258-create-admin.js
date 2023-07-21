const mongoose = require('mongoose');
const config = require('config');
const User = require('../src/database/models/user');

module.exports = {
  async up() {
    await mongoose.connect(config.get('database').url, { useNewUrlParser: true, useUnifiedTopology: true });

    const user = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: config.get('admin').password, // No almacenes contraseñas en texto plano en producción
      role: 'admin',
    });

    await user.save();
    await mongoose.connection.close();
  },

  async down() {
    await mongoose.connect(config.get('database').url, { useNewUrlParser: true, useUnifiedTopology: true });

    // Eliminar usuario
    await User.deleteOne({ email: 'admin@example.com' });

    await mongoose.connection.close();
  },
};
