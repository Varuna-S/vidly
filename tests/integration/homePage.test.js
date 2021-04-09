const request = require('supertest');

describe('/', () => {
    beforeEach(() => { 
        server = require('../../index'); 
    });
    afterEach( async () => { 
        await server.close();
     });

    describe('GET /', () => {
        it('should return hello world response', async () => {
            const response = await request(server).get('/');
            expect(response.status).toBe(200);
            expect(response.text).toMatch(/Hello World/);
        });
    });
});