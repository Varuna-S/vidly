const express = require('express');
const _ = require('lodash');
const { Genre } = require('../models/genre');
const {Movie, validate} = require('../models/movie');


const router = express.Router();


//GET
router.get('/', async (request, response) =>{
    const movies = await Movie
        .find()
        .sort({name:1});
    response.send(movies);
});

router.get('/:id',async (request,response) => {
    const movies = await Movie.findOne({_id: request.params.id});
    if(!movies)
        return response.status(404).send(`Movie could not be found`);
    response.send(movies);
});

//POST
router.post('/', async (request, response) => {
    //Input validation
    const {error} = validate(request.body);
    if(error)
        return response.status(400).send(error.details[0].message);

    const genre = await Genre.findOne({ _id: request.body.genreId})
    if(!genre)
        return response.status(400).send(`Genre was id: ${request.body.genreId} was not found`);
    let movie = new Movie({
        title: request.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: request.body.numberInStock,
        dailyRentalRate: request.body.dailyRentalRate
    });
    try{
    await movie.save();    
    response.send(movie);
    }
    catch(ex)
    {
        console.log(ex);
    }
});

//PUT
router.put('/:id',  async (request,response) => {
    const {error} = validate(request.body);
    if(error)
        return response.status(400).send(error.details[0].message);
    try{    
    let movie = await Movie.findOne({_id: request.params.id});
    if(!movie)
        return response.status(400).send(`Could not find genre with id: ${request.params.id}`);
    movie.title = request.body.title;
    movie.numberInStock = request.body.numberInStock;
    movie.dailyRentalRate = request.body.dailyRentalRate;
    await movie.save();
    response.send(movie);
    }
    catch(ex){
        console.log(ex);
    }
});

//DELETE
router.delete('/:id', async (request, response) => {
    try{
    const movie = await Movie.deleteOne({_id: request.params.id});
    if(!movie)
        return response.status(404).send(`Could not find movie with id: ${request.params.id}`);
    response.send(movie);
    }
    catch(ex)
    {
            console.log(ex);
    }
    
});


module.exports = router;
