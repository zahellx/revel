const express = require('express');
const authRoute = require('./auth');
const userRoute = require('./users');
const docsRoute = require('./docs');
const productsRoute = require('./products');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/docs', docsRoute);
router.use('/products', productsRoute);

module.exports = router;
