const {User} = require('../../models/user');
const request = require('supertest');
const {Genre} = require('../../models/genre');



describe('Auth middleware', () => {
    let token;
    let server;

    beforeEach(() => {
        server = require('../../app');
        token = new User().generateAuthToken() 
    });
    afterEach( async () => {
        await server.close();
        await Genre.deleteMany({});
    });

    const exec =  () => {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1'});
    };
    it('should return 401 is no valid token', async () => {
        token = '';
        const response = await exec();
        expect(response.status).toBe(401);
    });
    it('should return 400 if token is invalid', async () => {
        token = null;
        const response = await exec();
        expect(response.status).toBe(400);
    });
    it('should return 200 if token is valid', async () => {
        const response = await exec();
        expect(response.status).toBe(200);
    });
});
