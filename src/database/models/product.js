const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const { categories } = require('../../constants/categories');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: categories,
    },
    price: {
      type: Number,
      required: true,
      validate(value) {
        if (value <= 0) {
          throw new Error('Price must be greater than 0.');
        }
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // This is assuming your user model is called 'User'
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} name - The product's name
 * @returns {Promise<boolean>}
 */
productSchema.statics.isNameTaken = async function (name) {
  const product = await this.findOne({ name });
  return !!product;
};

/**
 * @typedef Product
 */
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
