const mongoose = require('mongoose');
const Joi = require('joi');

//SCHEMA
const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50 
    }
});

//MODEL
const Genre = mongoose.model("Genre", genreSchema);

function validateGenre(input) {

    const schema = Joi.object({
        name : Joi
        .string()
        .min(4)
        .max(50)
        .required()         
    });
    return schema.validate(input);
}

exports.genreSchema = genreSchema;
exports.Genre = Genre;
exports.validate = validateGenre;