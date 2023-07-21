const config = require('config');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const database = require('./database');
const logger = require('./utils/logger');

let server;
database.initDatabase(config.get('database')).then(() => {
  const options = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem')),
  };
  server = https.createServer(options, app);
  server.listen(config.get('port'), () => {
    logger.info(`Listening to port ${config.port}`);
  });
  // server = app.listen(config.get('port'), () => {
  //   logger.info(`Listening to port ${config.port}`);
  // });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
