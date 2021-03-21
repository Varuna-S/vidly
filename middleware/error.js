const winston = require('winston');

function error(err, request, response, next){
    winston.log('error',err.message, {metadata : err});
    response.status(500).send("Something failed");
}

module.exports = error;