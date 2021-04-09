const request = require('supertest');
const {User} = require('../../models/user');

describe('/api/users', () => {
    let server;
    let token;
    beforeEach(async () => {
        server = require('../../index');
        if(process.env.NODE_ENV === 'test')
            await User.deleteMany({});
        
    });

    afterEach( async () => {
        await server.close();
        await User.deleteMany({});
    });

    describe('/me', () => {
        let user;
        beforeEach(async () => {
            user = new User({ 
                name : 'name1',
                email : 'email1@gmail.com',
                password : 'password1'
            });
            await user.save();
            token = user.generateAuthToken();

        });
        const exec = () => {
            return request(server)
                .get('/api/users/me')
                .set('x-auth-token', token);
        };
        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return user details if the request is valid', async () => {
            const response = await exec();
            expect(response.status).toBe(200);
        });
    });

    describe('POST /', () => {
        let name;
        let email;
        let password;

        beforeEach(() => {
            name = 'name1';
            email = 'email1@gmail.com';
            password = 'password1';
        });

        const exec = () => {
            return request(server)
                .post('/api/users')
                .send({ name, email, password});
        };
        it('should return 400 if name is less than 3 characters', async () => {
            name =  'a';
            const response = await exec();
            expect(response.status).toBe(400);
        }); 
        it('should return 400 if name is more than 50 characters', async () => {
            name =  new Array(52).join('a');;
            const response = await exec();
            expect(response.status).toBe(400);
        }); 
        it('should return 400 if email is invalid', async () => {
            email = 'a';
            const response = await exec();
            expect(response.status).toBe(400);
        });        
        it('should return 400 if email is less than 3 characters', async () => {
            email = 'a@t.i';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if email is more than 255 characters', async () => {
            email =new Array(257).join('a') + '@gmail.com';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if password is less than 8 characters', async () => {
            password = 'a';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if password is more than 255 characters', async () => {
            password = new Array(257).join('a');
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return return 400 if already email exists', async () => {
            await User.create({ name, email, password});
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should save user in the DB if the request is processed', async () => {
            const response = await exec();
            const userInDb = await User.findOne({email});
            expect(userInDb.name).toBe(name);
            expect(userInDb.email).toBe(email);
        });
        it('should return user details except password if the request is processed', async () => {
            const response = await exec();
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name', name);
            expect(response.body).toHaveProperty('email', email);
            expect(response.body).not.toHaveProperty('password');
        });
    });
});