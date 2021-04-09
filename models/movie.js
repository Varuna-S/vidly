const mongoose = require('mongoose');
const Joi = require('joi');
const {genreSchema} = require('../models/genre');

//SCHEMA
const movieSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true,
        trim: true, 
        minlength: 1, 
        maxlength: 255
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number, 
        required: true,
        min: 0,
        max:255
    },
    dailyRentalRate: {
        type: Number, 
        required: true,
        min: 0,
        max:255
    }
});

//MODEL
const Movie = mongoose.model('Movie', movieSchema);

function validateMovie(movie) {
    const schema = Joi.object({
        title: Joi.string().min(1).max(255).required(),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number().min(0).max(255).required(),
        dailyRentalRate: Joi.number().min(0).max(255) .required()
    });
    return schema.validate(movie)
}

exports.Movie = Movie;
exports.validateMovie = validateMovie;