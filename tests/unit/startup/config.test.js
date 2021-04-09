const config = require('config');
const configStartup = require('../../../startup/config');

describe('config', () => {
    it('should throw an error if the private key is not defined', () => {
        config.get = jest.fn().mockReturnValue('');
        expect(() => configStartup()).toThrow();
    });
});