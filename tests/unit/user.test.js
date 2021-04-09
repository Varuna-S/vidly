const {User} = require('../../models/user');
const config = require('config');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose');

describe('user.generateAuthToken', () => {
    it('should return a valid json web token for the user', () => {
        const payload = { 
            _id: new Mongoose.Types.ObjectId().toHexString(), 
            isAdmin: false 
        }
        const user = new User(payload);
        const token = user.generateAuthToken();
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        expect(decoded).toMatchObject(payload);
    });
});