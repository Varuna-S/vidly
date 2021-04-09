require('express-async-errors');  // monkey patcher
const winston = require('winston');
require('winston-mongodb');
const config = require('config');

module.exports = function() {
    winston.configure({
        transports: [
            new winston.transports.Console({
                level: 'info',
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            }),
            new winston.transports.File({filename:'logfile.log'}),
            new winston.transports.MongoDB({
                db: config.get('db')
            }) 
        ],
        exceptionHandlers: [
            new winston.transports.File({ filename: 'exceptions.log' }),
            new winston.transports.File({ filename: 'logfile.log' })
        ],
        rejectionHandlers: [
            new winston.transports.File({ filename: 'rejections.log' }),
            new winston.transports.File({ filename: 'logfile.log' })
        ]
    });
    
}