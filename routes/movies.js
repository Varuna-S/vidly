const express = require('express');
const _ = require('lodash');
const { Genre } = require('../models/genre');
const {Movie, validateMovie} = require('../models/movie');
const auth  = require('../middleware/authmiddleware');
const validateObjectId  = require('../middleware/validateObjectId');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');

const router = express.Router();


//GET
router.get('/', async (request, response) =>{
    const movies = await Movie
        .find()
        .sort({title:1});
    response.send(movies);
});

router.get('/:id', validateObjectId, async (request,response) => {
    const movies = await Movie.findOne({_id: request.params.id});
    if(!movies)
        return response.status(404).send(`Movie could not be found`);
    response.send(movies);
});

//POST
router.post('/', [auth, validate(validateMovie)], async (request, response) => {
    const genre = await Genre.findOne({ _id: request.body.genreId})
    if(!genre)
        return response.status(404).send(`Genre was id: ${request.body.genreId} was not found`);

    let movie = new Movie({
        title: request.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: request.body.numberInStock,
        dailyRentalRate: request.body.dailyRentalRate
    });
    await movie.save(); 

    response.send(movie);
});

//PUT
router.put('/:id', [auth, validateObjectId, validate(validateMovie)], async (request,response) => {
    let movie = await Movie.findOne({_id: request.params.id});
    if(!movie)
        return response.status(404).send(`Could not find movie with id: ${request.params.id}`);
    movie.title = request.body.title;
    movie.numberInStock = request.body.numberInStock;
    movie.dailyRentalRate = request.body.dailyRentalRate;
    await movie.save();
    response.send(movie);
});

//DELETE
router.delete('/:id', [auth, admin, validateObjectId], async (request, response) => {
    const movie = await Movie.deleteOne({_id: request.params.id});
    if(!movie || movie.deletedCount === 0)
        return response.status(404).send(`Could not find movie with id: ${request.params.id}`);
    response.send(movie);
});


module.exports = router;
