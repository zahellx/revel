const moment = require('moment');
const config = require('config');
const { tokenTypes } = require('../../src/constants/tokens');
const tokenService = require('../../src/services/token');
const { userOne, admin } = require('./user.fixture');

const accessTokenExpires = moment().add(config.get('jwt').accessExpirationMinutes, 'minutes');
const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);

module.exports = {
  userOneAccessToken,
  adminAccessToken,
};
