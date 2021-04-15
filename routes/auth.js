const express = require('express');
const Joi = require('joi');
const {User} = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcryptjs');



const router = express.Router();

router.post('/', async (request, response) =>{
    const {error} = await validate(request.body); 
    if(error)
        return response.status(400).send('Invalid email or password');
    const user = await User.findOne({email: request.body.email});
    if(!user)
        return response.status(400).send('Invalid email or password');
    const isPasswordValid= await bcrypt.compare(request.body.password, user.password);
    if(!isPasswordValid)
        return response.status(400).send('Invalid email or password');
    const token = user.generateAuthToken();
    response.header('x-auth-token', token).send(_.pick(user, ['id','name','email']));
});


function validate(input) {
    const schema = Joi.object({
        email: Joi.string().min(3).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    });
    return schema.validate(input);
}

module.exports = router;