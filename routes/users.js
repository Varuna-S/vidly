const mongoose = require('mongoose');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {User, validate} = require('../models/user');
const auth = require('../middleware/authmiddleware');

const router = express.Router();

router.get('/me', auth, async (request, response) => {
    const user = await User.findById(request.user._id).select('-password');
    response.send(user);
});

//POST LOGIN
router.post('/', async (request, response) =>{
    const {error} = validate(request.body);
    if(error)
        return response.status(400).send(error.details[0].message);
    let user = await User.findOne({email: request.body.email});
    if(user)
        return response.status(400).send("User already registered with this email");
    user = new User(_.pick(request.body, ['name','email','password']));
    const salt = await bcrypt.genSalt(10);
    user.password= await bcrypt.hash(user.password, salt);
    await user.save();
    response.send(_.pick(user, ['_id', 'name','email']));
});

module.exports = router;