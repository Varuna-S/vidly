const express = require('express');
const auth = require('../middleware/authmiddleware');
const {Rental, validateRentals} = require('../models/rental');
const {Movie} = require('../models/movie');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/', [auth, validate(validateRentals)], async (request, response) =>{
    const rental = await Rental.lookup(request.body.customerId, request.body.movieId);
    if(!rental)
        return response.status(404).send('Rental not found');
    if(rental.dateReturned)
        return response.status(400).send(('Rental return already processed'));
    
    rental.return();
    await rental.save();

    const movie = Movie.findOne({ _id: rental.movie._id});
    await movie.update({$inc : { numberInStock : 1}});

    return response.status(200).send(rental);
});


module.exports =  router;