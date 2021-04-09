const mongoose = require('mongoose');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {User, validateUser} = require('../models/user');
const auth = require('../middleware/authmiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/me', auth, async (request, response) => {
    const user = await User.findById(request.user._id).select('-password');
    response.send(user);
});

//POST LOGIN
router.post('/', validate(validateUser), async (request, response) =>{
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