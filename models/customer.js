const mongoose = require('mongoose');
const Joi = require('joi');


//SCHEMA
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50 
    },
    isGold:{ 
        type: Boolean,
        default: false,    
    },
    phone:{
        type: String,
        required: true,
        minlength:5,
        maxlength:11
    }
});

//MODEL
const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(input) {

    const schema = Joi.object({
        name : Joi.string().min(4).max(50).required(),
        isGold : Joi.boolean(), 
        phone: Joi.string().min(5).max(10).required()
    });
    return schema.validate(input);
}


exports.Customer = Customer;
exports.validateCustomer = validateCustomer;