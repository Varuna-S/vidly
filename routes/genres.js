const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug');
const _ = require('lodash');
const {Genre, validateGenre} = require('../models/genre');
const auth  = require('../middleware/authmiddleware');
const admin  = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');

const router = new express.Router();

//GET
router.get('/', async (request, response) =>{
    const genres = await Genre
        .find()
        .sort({name: 1});
    response.send(genres);
});

router.get('/:id', validateObjectId, async (request,response) => {
    const genre = await Genre.findOne({_id: request.params.id});
    if(!genre)
        return response.status(404).send(`Genre could not be found`);
    response.send(genre);
});

//POST
router.post('/', [auth, validate(validateGenre)], async (request,response) => {
    let genre = new Genre({ name: request.body.name });
    
    await genre.save();
    
    response.send(genre);
});

//PUT
router.put('/:id', [auth, validateObjectId, validate(validateGenre)], async (request,response) => { 
    let genre = await Genre.findOne({_id: request.params.id});
    if(!genre)
        return response.status(404).send(`Could not find genre with id: ${request.params.id}`);
    genre.name = request.body.name;
    await genre.save();
    response.send(genre);   
});

//DELETE
router.delete('/:id', [auth, admin, validateObjectId], async (request, response) => {
    const genre = await Genre.deleteOne({_id: request.params.id});
    if(!genre || genre.deletedCount === 0)
        return response.status(404).send(`Could not find genre with id: ${request.params.id}`);
    response.send(genre);
});


module.exports = router;
