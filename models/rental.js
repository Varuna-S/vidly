const mongoose = require('mongoose');
const Joi = require('joi');

//Schema
const rentalSchema = new mongoose.Schema({
    customer:{
        type: new mongoose.Schema({
            name: {
                type:String,
                required: true,
                minlength: 4,
                maxlength: 50
            },
            isGold: { 
                type: Boolean,
                default: false,    
            },
            phone: {
                type: String,
                required: true,
                minlength:5,
                maxlength:11
            }
        }),
        required: true
    },
    movie : {
        type: new mongoose.Schema({
            title: {
                type: String, 
                required: true,
                trim: true, 
                minlength: 1, 
                maxlength: 255
            },
            dailyRentalRate: {
                type: Number, 
                required: true,
                min: 0,
                max:255
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateReturned: {
        type: Date
         
    },
    rentalFee: {
        type: Number,
        min: 0
    }
});

//MODEL
const Rental = mongoose.model('Rental', rentalSchema);

function validateRentals(rental)
{
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
    return schema.validate(rental);
}

exports.Rental = Rental;
exports.validate = validateRentals;