const error = require('../../../middleware/error');
let winston = require('winston');

describe('Error middleware', () => {
    const next = jest.fn();
    const request = {};
    const response = {};
    const err = new Error();
    winston.log = jest.fn();
    it('should throw an error ', () => {        
        expect(() =>error(err, request, response, next) ).toThrow();
    });
});