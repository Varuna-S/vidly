const request = require('supertest');
const {Rental} = require('../../models/rental');
const mongoose = require('mongoose');
const {User} = require('../../models/user');
const {Movie} = require('../../models/movie');
const moment = require('moment');

describe('/api/returns', () => {
    beforeEach( async () => {
        server = require('../../index');
        token = new User().generateAuthToken();
    });
    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Movie.deleteMany({});
    });
    describe('POST /', () => {
        let server;
        let customerId;
        let movieId;
        let rental;
        let token;
        let movie;
        beforeEach( async () => {
            server = require('../../index');
            token = new User().generateAuthToken();
            customerId = new mongoose.Types.ObjectId();
            movieId = new mongoose.Types.ObjectId();
            movie = new Movie({
                _id: movieId,
                title: 'movie1',
                genre:{ name:'genre1'},
                numberInStock: 0,
                dailyRentalRate: 2
            });
            

            rental = new Rental({
                customer: {
                    _id: customerId,
                    name: 'customer1',
                    phone: 'phone1'
                },
                movie : {
                    _id: movieId,
                    title: 'movie1',
                    dailyRentalRate: 2
                }
            });

            await movie.save();
            await rental.save();
        });
    

        const exec = () => {
            return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({customerId, movieId});
        };

        it('should return the rental if the id is valid', () => {
            const result = Rental.findById(rental._id)
            expect(result).not.toBeNull();
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });

        it('should return 400 if customerId is not provided', async () => {
            customerId = '';
            const response = await exec();
            expect(response.status).toBe(400);
        });

        it('should return 400 if movieId is not provided', async () => {
            movieId = '';
            const response = await exec();
            expect(response.status).toBe(400);
        });

        it('should return 404 if no rental found for the customer/movie', async () => {
            await Rental.deleteMany({});
            const response = await exec();
            expect(response.status).toBe(404);
        });

        it('should return 400 if return already processed', async () => {
            rental.dateReturned = Date.now();
            await rental.save();
            const response = await exec();
            expect(response.status).toBe(400);
        });

        it('should return 200 if it is a valid request', async () => {
            const response = await exec();
            let rentalInDb = await Rental.findOne({ _id: rental._id});
            expect(response.status).toBe(200);
            const dateTimeDifference = new Date() - rentalInDb.dateReturned;
            expect(dateTimeDifference).toBeLessThan(10000);
        });

        it('should set the rental fee for a valid return request', async () => {
            rental.dateOut = moment().add(-7, 'days').toDate();
            await rental.save();
            const response = await exec();
            let rentalInDb = await Rental.findOne({ _id: rental._id});
            expect(rentalInDb.rentalFee).toBe(14);
        });

        it('should increase the stock number if the return is processed', async () => {
            const response = await exec();
            let movieInDb = await Movie.findOne({ _id: movie._id});
            expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
        });

        it('should return rental if the return is processed', async () => {
            const response = await exec();
            let rentalInDb = await Rental.findOne({ _id: rental._id});
            expect(Object.keys(response.body)).toEqual(expect.arrayContaining([
                'dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie'
            ]));
        });
    });
});
