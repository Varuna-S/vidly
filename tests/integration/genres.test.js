const request = require('supertest');
const {Genre} = require('../../models/genre');
const Mongoose = require('mongoose');
const {User} = require('../../models/user');

let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach( async () => { 
        server.close();
        await Genre.deleteMany({});
     });

    describe('GET /', () => {
        it('should return all the genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1'},
                { name: 'genre2'},
            ]);
            const response = await request(server).get('/api/genres/');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body.some(genre => genre.name === 'genre1')).toBeTruthy();
            expect(response.body.some(genre => genre.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return genre if valid id is passed', async () => {
            const genre = new Genre({
                _id: new Mongoose.Types.ObjectId(),
                name: 'genre1'
            });
            await Genre.collection.insertOne(genre);
            const response = await request(server).get(`/api/genres/${genre._id}`);
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('genre1');
        });

        it('should return 404 if the id is invalid', async () => {
            const response = await request(server).get('/api/genres/1');
            expect(response.status).toBe(404);
        });

        it('should return 404 if the genre doesnt exist', async () => {
            const response = await request(server).get(`/api/genres/${new Mongoose.Types.ObjectId().toHexString()}`);
            expect(response.status).toBe(404);
        });
    });

    describe('POST /', () => {

        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });

        it('should return 400 if the genre length is less than 4 characters', async () => {
            name = 'aaa';
            const response = await exec();
            expect(response.status).toBe(400);
        });

        it('should return 400 if genre length is more than 50 characters', async () => {
            name = new Array(52).join('a');
            const response = await exec();
            expect(response.status).toBe(400);    
        });

        it('should save the genre if the genre is valid', async () => {
            const response = await exec();
            const genre = await Genre.findOne({ name: 'genre1'});
            expect(genre).not.toBeNull();
        });

        it('should return the genre if the genre is valid', async () => {
            const response = await exec();
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name','genre1');
        });
    });

});