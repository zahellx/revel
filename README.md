# RESTful API Node Server
RESTful API built with Node.js, Express, and Mongoose.

## Quick Start
To set up the project, you have the option to deploy it either locally or using Docker.

If you opt for a local deployment, a running instance of MongoDB is mandatory.

The quickest way to get the project running is by using Docker commands. Executing npm run docker:dev and docker:test will initiate a MongoDB instance and the application itself, with all configurations linked properly.

Should the request return certificate validation errors, it's advised to disable validation on the particular request.

Upon running the application for the first time, a migration will occur creating an admin user which can be utilized within the application.

```bash

name: admin
password: 01admin*

```

If you're planning to run the project using Docker, and you have permissions error with the './data' folder it's important to delete it. 
If you use the command `npm run docker:test` after `npm run docker:dev` you must delete the folder too.

This can be done using the 'sudo' command for elevated permissions. Here's how you can do it:

```bash

sudo rm -r ./data

```

Inside the 'insomnia' folder, you will find an exported collection of requests from Insomnia, accompanied by a pre-configured Base Environment.
You'll need to use the 'login' request and the tokens will be set accordingly.

## Table of Contents

- [Commands](#commands)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Logging](#logging)
- [Mongoose Plugins](#mongoose-plugins)
- [Linting](#linting)

## Commands

Running locally:

```bash
npm run start
```

Testing:

```bash
# run all tests
npm run test

# run all tests in watch mode
npm run test:watch

# run test coverage
npm run coverage
```

Docker:

```bash
# run docker container in development mode
npm run docker:dev

# run all tests in a docker container
npm run docker:test
```

Linting:

```bash
# run ESLint
npm run lint
```

## Configuration

Configuration is done using [config](https://github.com/node-config/node-config#readme).
The configuration variables can be found and modified in the `/config/default.yml` file. They come with these default values:

```bash
database:
  url: mongodb://mongodb:27017/revel
  databaseName: revel

jwt:
  secret: "12345"
  accessExpirationMinutes: 30
  refreshExpirationDays: 20

admin:
  password: 01admin*

env: development
port: 3000
```
The default file configure the project to use docker with
 
```
  npm run docker:dev
```
The test file configure the project to run the tests in docker with

```
  npm run docker:test
```

- database: Mongodb configuration. 
- jwt: JWT configuration.
- admin: Admin user configuration. Used to populate the admin user.
- env: Environment. If you use development you enable development logs
- port: Port where the server listen



## Project Structure

```
config\             # configuration files
src\
 |--certs\          # ssl certificates
 |--constants       # Constants files
 |--controllers\    # Route controllers (controller layer)
 |--database\       # Mongodb (data layer)
  |--models         # Mongoose models
  |--plugins        # Mongoose plugins
 |--docs\           # Swagger files
 |--middlewares\    # Express middlewares and middleware configs
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
```

## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:3000/v1/docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files.

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/refresh-tokens` - refresh auth tokens\

**User routes**:\
`POST /v1/users` - create a user\
`GET /v1/users` - get all users\
`GET /v1/users/:userId` - get user\
`PATCH /v1/users/:userId` - update user\
`DELETE /v1/users/:userId` - delete user\
`GET /v1/users/:userId/products` - get user products\

**Product routes**:\
`POST /v1/product` - create a product\
`GET /v1/product` - get all products\
`GET /v1/product/:productId` - get product\
`PATCH /v1/product/:productId` - update product\
`DELETE /v1/product/:productId` - delete product\

## Error Handling

The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```javascript
const catchAsync = require('../utils/catchAsync');

const controller = catchAsync(async (req, res) => {
  // this error will be forwarded to the error handling middleware
  throw new Error('Something wrong happened');
});
```

The error handling middleware sends an error response, which has the following format:

```json
{
  "code": 404,
  "message": "Not found"
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```javascript
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
};
```

## Validation

Request data is validated using [Joi](https://joi.dev/).

The validation schemas are defined in the `src/validations` directory and are used in the routes by providing them as parameters to the `validate` middleware.

```javascript
const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user');
const userController = require('../../controllers/user');

const router = express.Router();

router.post('/users', validate(userValidation.createUser), userController.createUser);
```

## Authentication

Authenticated routes use the `auth` middleware.

```javascript
const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user');

const router = express.Router();

router.post('/users', auth(), userController.createUser);
```

These routes require a valid JWT access token in the Authorization request header using the Bearer schema. If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

**Generating Access Tokens**:

An access token can be generated by making a successful call to the register (`POST /v1/auth/register`) or login (`POST /v1/auth/login`) endpoints. The response of these endpoints also contains refresh tokens (explained below).

You can modify this expiration time by changing the `jwt.accessExpirationMinutes` configuration.

**Refreshing Access Tokens**:

After the access token expires, a new access token can be generated, by making a call to the refresh token endpoint (`POST /v1/auth/refresh-tokens`) and sending along a valid refresh token in the request body. This call returns a new access token and a new refresh token.

You can modify this expiration time by changing the `refreshExpirationDays` environment variable in the .env file.

## Authorization

The `auth` middleware can also be used to require certain rights/permissions to access a route.

```javascript
const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user');

const router = express.Router();

router.post('/users', auth('manageUsers'), userController.createUser);
```

In the example above, an authenticated user can access this route only if that user has the `manageUsers` permission.

The permissions are role-based. You can view the permissions/rights of each role in the `src/constants/roles.js` file.

If the user making the request does not have the required permissions to access this route, a Forbidden (403) error is thrown.

## Logging

Import the logger from `utils/logger.js`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```javascript
const logger = require('<path to src>/utils/logger');

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
```
In development mode, log messages of all severity levels will be printed to the console.
In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\

## Mongoose Plugins

The app contains 2 custom mongoose plugins that you can attach to any mongoose model schema. You can find the plugins in `src/database/plugins`.

```javascript
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    /* schema definition here */
  },
  { timestamps: true }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

const User = mongoose.model('User', userSchema);
```

### toJSON

The toJSON plugin applies the following changes in the toJSON transform call:

- removes \_\_v, createdAt, updatedAt, and any schema path that has private: true
- replaces \_id with id

### paginate

The paginate plugin adds the `paginate` static method to the mongoose schema.

Adding this plugin to the `User` model schema will allow you to do the following:

```javascript
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};
```

The `filter` param is a regular mongo filter.

The `options` param can have the following (optional) fields:

```javascript
const options = {
  sortBy: 'name:desc', // sort order
  limit: 5, // maximum results per page
  page: 2, // page number
};
```

The plugin also supports sorting by multiple criteria (separated by a comma): `sortBy: name:desc,role:asc`

The `paginate` method returns a Promise, which fulfills with an object having the following properties:

```json
{
  "results": [],
  "page": 2,
  "limit": 5,
  "totalPages": 10,
  "totalResults": 48
}
```

## Linting

Linting is done using [ESLint](https://eslint.org/).

ESLint is configured to follow the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base).

To modify the ESLint configuration, update the `.eslintrc.json` file. 

To prevent a certain file or directory from being linted, add it to `.eslintignore` and `.prettierignore`.

To maintain a consistent coding style across different IDEs, the project contains `.editorconfig`

## Inspirations

- [node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate/tree/master)

