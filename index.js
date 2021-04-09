const express = require('express');
const debug = require('debug')('app:index'); 
const winston = require('winston');

const app = express();

require('./startup/config')();
require('./startup/logging')();
require('./startup/databaseInitialisation')();
require('./startup/validation')();
require('./startup/routes')(app);
require('./startup/prod')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening to port ${port}`));

module.exports = server;