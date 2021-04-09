const request = require('supertest');
const mongoose = require('mongoose');
const {User} = require('../../models/user');
const {Rental} = require('../../models/rental');
const {Movie} = require('../../models/movie');
const {Customer} = require('../../models/customer');
const {Genre} = require('../../models/genre');

describe('/api/rentals', () => {
    let server;
    let genre;
    let movie;
    let customer;
    beforeEach( async () => {
        server = require('../../index');
        if(process.env.NODE_ENV === 'test')
        {
            await Rental.deleteMany({});
            await Movie.deleteMany({});
            await Customer.deleteMany({});
            await Genre.deleteMany({});
        }
        token = new User().generateAuthToken();

        genre = new Genre({
            name: 'genre1'
        });
        await genre.save();

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

        customer = new Customer({
            name : 'name1',
            phone : '1234567'
        });
        await customer.save();
    });
    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        await Customer.deleteMany({});
        await Genre.deleteMany({});
    });
    describe('GET /', () => {
        let rental
        let rentalId;
        beforeEach(async () => {
            rentalId = new mongoose.Types.ObjectId().toHexString();
            rental = new Rental({
                _id: rentalId,
                movie,
                customer
            })
            await rental.save();
        });
        it('should return all the rentals', async () => {
            const response = await request(server)
                .get('/api/rentals')
                .set('x-auth-token', token);
            expect(response.body.some(rentalReceived => rentalReceived._id === rentalId)).toBeTruthy();
            expect(response.body.some(rentalReceived => rentalReceived.movie.title === movie.title)).toBeTruthy();
            expect(response.body.some(rentalReceived => rentalReceived.movie.title === movie.title)).toBeTruthy();    
        });
    });

    describe('POST /', () => {
        let customerId;
        let movieId;
        beforeEach(() => {
            customerId = customer._id;
            movieId = movie._id;
        });
        const exec = () => {
            return request(server)
                .post('/api/rentals')
                .set('x-auth-token', token)
                .send({customerId, movieId});
        };
        it('should return 401 if user not logged in', async () => {
           token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return 400 if movieId is invalid', async () => {
            movieId =  1;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if customerId is invalid', async () => {
            customerId = 1;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if no movie found with movieId', async () => {
            movieId = new mongoose.Types.ObjectId().toHexString();
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if no customer found with customerId', async () => {
            customerId = new mongoose.Types.ObjectId().toHexString();
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if no movie in stock', async () => {
            await Movie.findOneAndUpdate({ _id: movieId }, { numberInStock: 0 });
            const response = await exec();
            expect(response.status).toBe(400);
        });

        it('should return the rental if the request is processed', async () => {
            const response = await exec();
            expect(response.body).toHaveProperty('movie._id',movieId.toHexString());
        });
        
        it('should save the rental in the DB if the request is valid', async () => {
            const response = await exec();
            const rentalInDb = await Rental.findOne({'movie._id': movieId});
            expect(rentalInDb).toHaveProperty('movie._id', movieId);
        });
    });
});
