const { request, response } = require('express');
const mongoose = require('mongoose');
const express = require('express');
const Joi = require('joi');
const debug = require('debug');
const _ = require('lodash');
const {Customer, validate} = require('../models/customer');

const router = new express.Router();

//GET
router.get('/', async (request, response) =>{
    const customers = await Customer
        .find()
        .sort({name:1});
    response.send(customers)
});

router.get('/:id',async (request,response) => {
    const customer = await Customer.findOne({_id: request.params.id});
    if(!customer)
        return response.status(404).send(`Customer could not be found`);
    response.send(customer);
});

//POST
router.post('/', async (request,response) => {
    //Input validation
    const {error} = validate(request.body);
    if(error)
        return response.status(400).send(error.details[0].message);
    let customer = new Customer(_.pick(request.body, ['name', 'isGold', 'phone']));
    
    await customer.save();
    response.send(customer);
});

//PUT
router.put('/:id',  async (request,response) => {
    const {error} = validate(request.body);
    if(error)
        return response.status(400).send(error.details[0].message);
        
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
router.delete('/:id', async (request, response) => {
    const customer = await Customer.deleteOne({_id: request.params.id});
    if(!customer)
        return response.status(404).send(`Could not find customer with id: ${request.params.id}`);
    response.send(customer);
    
});

module.exports = router;
