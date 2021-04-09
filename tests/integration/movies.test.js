const request = require('supertest');
const mongoose = require('mongoose');
const {User} = require('../../models/user');
const {Movie} = require('../../models/movie');
const {Genre} = require('../../models/genre');

describe('/api/movies', () => {
    let server;
    let token;
    let genre;

    beforeEach(async () => {
        server = require('../../index');
        if(process.env.NODE_ENV === 'test')
            await Movie.deleteMany({});
        token = new User().generateAuthToken();
        genre = new Genre({
            name: 'genre1'
        });
        await genre.save();
    });

    afterEach( async () => {
        await server.close();
        await Movie.deleteMany({});
        await Genre.deleteMany({});
    });

    describe('GET /', () => {
        beforeEach(async () => {
            const movie1 = new Movie({ 
                title: 'title1',
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: 5,
                dailyRentalRate: 2
            });
            const movie2 = new Movie({ 
                title: 'title2',
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: 5,
                dailyRentalRate: 2
            });
            await Movie.insertMany([movie1, movie2]);
        });
        it('should return all movies', async () => {
            const response = await request(server).get('/api/movies');
            expect(response.status).toBe(200);
            expect(response.body.some(movie => movie.title === 'title1')).toBeTruthy();
            expect(response.body.some(movie => movie.title === 'title2')).toBeTruthy();
        });       
    });

    describe('GET /:id', () => {
        let movieId;
        let movie;
        beforeEach(async () => {
            movie = new Movie({ 
                title: 'title1',
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: 5,
                dailyRentalRate: 2
            });
            await movie.save();
            movieId = movie._id;                     
        });
        const exec = () => {
            return request(server)
                .get(`/api/movies/${movieId}`);
        };
        it('should return 400 if id is invalid', async () => {
            movieId = 1;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 404 if no movie found with id', async () => {
            movieId = new mongoose.Types.ObjectId();
            const response = await exec();
            expect(response.status).toBe(404);
        }); 
        it('should return the movie if the id is valid', async () =>{ 
            const response = await exec();
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('title', movie.title);
            expect(response.body).toHaveProperty('genre.name', movie.genre.name);
        });  
    });
    
    describe('POST /', () => {
        let movie;
        beforeEach(() => {
            movie = new Movie({ 
                title: 'title1',
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: 5,
                dailyRentalRate: 2
            });
        });
        const exec = () => {
            return request(server)
                .post('/api/movies')
                .set('x-auth-token', token)
                .send({ 
                    title: movie.title,
                    genreId: movie.genre._id,
                    numberInStock: movie.numberInStock,
                    dailyRentalRate: movie.dailyRentalRate  
                });
        };
        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return 400 if the title is less than 1 character', async () => {
            movie.title = '' ;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if the title is more than 255 character', async () => {
            movie.title = new Array(257).join('a') ;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if the dailyRentalRate is less than 0', async () => {
            movie.dailyRentalRate = -1 ;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if the numberInStock is less than 0', async () => {
            movie.numberInStock = -1 ;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 404 if the genre is not found', async () => {
            movie.genre._id = new mongoose.Types.ObjectId().toHexString();
            const response = await exec();
            expect(response.status).toBe(404);
        });
        it('should save the movie in the DB if the request is valid', async () => {
            const response = await exec();
            const movieInDb = await Movie.findOne({ title: movie.title });
            expect(response.status).toBe(200);
            expect(movieInDb).toHaveProperty('genre.name', movie.genre.name);
            expect(movieInDb).toHaveProperty('numberInStock', movie.numberInStock);
        });
        it('should return the movie is the request is processed', async () => {
            const response = await exec();
            expect(response.body).toHaveProperty('title', movie.title);
            expect(response.body).toHaveProperty('genre.name', movie.genre.name);
            expect(response.body).toHaveProperty('numberInStock', movie.numberInStock);
            expect(response.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
        });
    });
    
    describe('PUT /:id', () => {
        let movieId;
        let newTitle;
        let newNumberInStock;
        let newDailyRentalRate;
        beforeEach( async () => {
            movie = new Movie({ 
                title: 'title1',
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: 5,
                dailyRentalRate: 2
            });
            await movie.save();
            movieId = movie._id;
            newTitle = 'newTitle1';
            newNumberInStock = 10;
            newDailyRentalRate = 5;
        });
        const exec = () => {
            return request(server)
                .put(`/api/movies/${movieId}`)
                .set('x-auth-token', token)
                .send({
                    title: newTitle,
                    genreId: movie.genre._id,
                    numberInStock: newNumberInStock,
                    dailyRentalRate: newDailyRentalRate
                 });
        };
        it('should return 401 if user not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        }); 
        it('should return 404 if movie not found', async () => {
            movieId = new mongoose.Types.ObjectId();
            const response = await exec();
            expect(response.status).toBe(404);
        });
        it('should return 400 if the new title is less than 1 character', async () => {
            newTitle = '' ;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if the new title is more than 255 character', async () => {
            newTitle = new Array(257).join('a') ;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if the new numberInStock is less than 0', async () => {
            newNumberInStock = -1 ;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if the new dailyRentalRate is less than 0', async () => {
            newDailyRentalRate = -1 ;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should update the movie in the DB id valid request', async () => {
            const response = await exec();
            const movieInDb = await Movie.findOne({ _id: movieId});
            expect(movieInDb).toHaveProperty('title', newTitle);
            expect(movieInDb).toHaveProperty('numberInStock', newNumberInStock);
            expect(movieInDb).toHaveProperty('dailyRentalRate', newDailyRentalRate);
        });
        it('should return the updated movie if request is processed', async () => {
            const response = await exec();
            expect(response.body).toHaveProperty('title', newTitle);
            expect(response.body).toHaveProperty('numberInStock', newNumberInStock);
            expect(response.body).toHaveProperty('dailyRentalRate', newDailyRentalRate);
        });
    });

    describe('DELETE /:id', () => {
        let movieId;
        beforeEach( async () => {
            token = new User({ isAdmin: true}).generateAuthToken();
            movie = new Movie({ 
                title: 'title1',
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: 5,
                dailyRentalRate: 2
            });
            await movie.save();
            movieId = movie._id;
        });
        const exec = () => {
            return request(server)
                .delete(`/api/movies/${movieId}`)
                .set('x-auth-token', token);
        };
        it('should return 401 if user is not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return 400 if the id is invalid', async () => {
            movieId = 1;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 403 if user is not admin', async () => {
            token = new User().generateAuthToken();
            const response = await exec();
            expect(response.status).toBe(403);
        });
        it('should return 404 if no movie found', async () => {
            movieId = new mongoose.Types.ObjectId();
            const response = await exec();
            expect(response.status).toBe(404);
        });
        it('should delete the movie in DB if request is valid', async () => {
            const response = await exec();
            const movieInDb = await Movie.findOne({ _id: movieId});
            expect(response.status).toBe(200);
            expect(movieInDb).toBeNull();
        });
    });
});