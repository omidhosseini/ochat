const Joi = require('joi');

const registerUser = Joi.object({
    userName: Joi.string().min(3).max(25).required()
});

 
exports.registerUserDto = registerUser;