const validateObjectId = require('../middleware/validateObjectId');
const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug');
const _ = require('lodash');
const {Genre, validate} = require('../models/genre');
const auth  = require('../middleware/authmiddleware');
const admin  = require('../middleware/admin');
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
router.post('/', auth, async (request,response) => {
    //Input validation
    const {error} = validate(request.body);
    if(error)
        return response.status(400).send(error.details[0].message);
    let genre = new Genre({ name: request.body.name });
    
    await genre.save();
    
    response.send(genre);
});

//PUT
router.put('/:id', async (request,response) => {
    const {error} = validate(request.body);
    if(error)
        return response.status(400).send(error.details[0].message);
    try{    
    let genre = await Genre.findOne({_id: request.params.id});
    if(!genre)
        return response.status(400).send(`Could not find genre with id: ${request.params.id}`);
    genre.name = request.body.name;
    await genre.save();
    response.send(genre);
    }
    catch(ex){
        console.log(ex);
    }
});

//DELETE
router.delete('/:id', [auth, admin], async (request, response) => {
    try{
    const genre = await Genre.deleteOne({_id: request.params.id});
    if(!genre)
        return response.status(404).send(`Could not find genre with id: ${request.params.id}`);
    response.send(genre);
    }
    catch(ex)
    {
            console.log(ex);
    }
    
});


module.exports = router;
