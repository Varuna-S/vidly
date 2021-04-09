const express = require('express');
const Joi = require('joi');
const _ = require('lodash');
const {Customer, validateCustomer} = require('../models/customer');
const auth  = require('../middleware/authmiddleware');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');

const router = new express.Router();

//GET
router.get('/', auth, async (request, response) =>{
    const customers = await Customer
        .find()
        .sort({name:1});
    response.send(customers)
});

router.get('/:id', [auth, validateObjectId], async (request,response) => {
    const customer = await Customer.findOne({_id: request.params.id});
    if(!customer)
        return response.status(404).send(`Customer could not be found`);
    response.send(customer);
});

//POST
router.post('/', [auth, validate(validateCustomer)], async (request,response) => {
    let customer = new Customer(_.pick(request.body, ['name', 'isGold', 'phone']));
    
    await customer.save();
    response.send(customer);
});

//PUT
router.put('/:id', [auth, validateObjectId, validate(validateCustomer)],  async (request,response) => {
    let customer = await Customer.findOne({_id: request.params.id});
    if(!customer)
        return response.status(404).send(`Could not find customer with id: ${request.params.id}`);
    customer.name = request.body.name;
    customer.isGold = request.body.isGold;
    customer.phone = request.body.phone;
    await customer.save();
    response.send(customer);
});

//DELETE
router.delete('/:id', [auth, admin, validateObjectId], async (request, response) => {
    const customer = await Customer.deleteOne({_id: request.params.id});
    if(!customer || customer.deletedCount === 0)
        return response.status(404).send(`Could not find customer with id: ${request.params.id}`);
    response.send(customer);
    
});

module.exports = router;
