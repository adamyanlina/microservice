const Joi = require('@hapi/joi');

const authRegisterSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required()
});

const authLoginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required()
});

module.exports = {
    authLoginSchema,
    authRegisterSchema
};
