const mongoose = require('mongoose');
const Joi = require('joi');
const moment  = require('moment');

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

rentalSchema.statics.lookup = function (customerId, movieId) {
    return Rental.findOne({ 
        'customer._id': customerId,
        'movie._id': movieId
    });
}

rentalSchema.methods.return = function() {
    this.dateReturned = Date.now();
    const rentedDays = moment().diff(this.dateOut, 'days');
    this.rentalFee =  rentedDays * this.movie.dailyRentalRate;
}

//MODEL
const Rental = mongoose.model('Rental', rentalSchema);

function validateRentals(input)
{
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
    return schema.validate(input);
}

exports.Rental = Rental;
exports.validateRentals = validateRentals;