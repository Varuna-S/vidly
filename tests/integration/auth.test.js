const request = require('supertest');
const {User} = require('../../models/user');
const bcrypt = require('bcrypt');

describe('auth', () => {
    describe('POST /', () => {
        let server;
        let user;
        let password;
        let salt;
        beforeEach( async () => {
            server = require('../../index');
            salt = await bcrypt.genSalt(10);
            password = 'password1';
            hashedPassword = await bcrypt.hash(password, salt);
            user = new User({ 
                name: 'name1',
                email: 'name1@gmail.com',
                password: hashedPassword
            });
            await user.save();
        });
        afterEach( async () => {
            await server.close();
            await User.deleteMany({});
        });
        const exec = () => {
            return request(server)
                .post('/api/auth')
                .send({ email: user.email, password: password});
        };
        it('should return 400 if either email or password is invalid', async () => {
            password = 'wrongPassword';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if email is not found', async () => {
            user.email = 'nonExistentUser@gmail.com';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if password is invalid', async () => {
            password = '';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return x-auth-token in the response header if both email and password is valid', async () => {
            const response = await exec();
            expect(response.header).toHaveProperty('x-auth-token');
        });

        it('should return user object if email and password is valid', async () => {
            const response = await exec();
            expect(response.status).toBe(200);
            expect(Object.keys(response.body)).toEqual(expect.arrayContaining(['id', 'name', 'email' ]));
        });
    });
});