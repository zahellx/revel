const Joi = require('joi');
const { categories } = require('../constants/categories');
const { password, objectId } = require('./custom');

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required().valid(...categories),
    price: Joi.number().required().min(0),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    category: Joi.string().valid(...categories),
    price: Joi.number().min(0),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      category: Joi.string().valid(...categories),
      price: Joi.number().min(0),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
