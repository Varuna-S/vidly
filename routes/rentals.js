const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');
const {Rental, validate} = require('../models/rental');
const {Movie} = require('../models/movie');
const {Customer} = require('../models/customer');
const Fawn = require('fawn');

Fawn.init(mongoose);
const router = express.Router();

//GET
router.get('/', async (request, response)=>{
    const rentals = await Rental
    .find()
    .sort('name');
    response.send(rentals);
});

//POST
router.post('/', async (request, response) =>{
    const {error} = validate(request.body);
    if(error) 
        return response.status(400).send(error.details[0].message);

    let movie = await Movie
        .findOne({ _id: request.body.movieId})
        .select('title dailyRentalRate');
    if(!movie)
        return response.status(400).send(`Movie with the id: ${request.body.movieId} not found`);

    if(movie.numberInStock === 0) return response.status(400).send(`Movie not in stock`);

    let customer = await Customer.findOne({ _id: request.body.customerId});
    if(!customer)
        return response.status(400).send(`Customer with the id: ${request.body.customerId} not found`);
    
    const rental = new Rental({
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        },
        customer:{
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
    });
    
    new Fawn.Task()
        .save('rentals',rental)
        .update('movies',{ _id: movie._id},{ $inc: { numberInStock: -1 }})
        .run();
    
    response.send(rental);
});


module.exports = router;