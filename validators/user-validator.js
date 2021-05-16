
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity').default;

const complexityOptions = {
    min: 8,
    max: 64,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4
};

exports.validateSignUp = (user) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(55).required(),
        email: Joi.string().min(10).max(255).email().required(),
        password: passwordComplexity(complexityOptions).required(),
        age: Joi.number().min(16).max(100).required(),
        nationalID : Joi.string().min(14).max(28).required(),
        phone_number: Joi.string().min(13).max(18).required(),
        gender : Joi.string().required(),
        username: Joi.string().required()
    });

    return schema.validate(user);
};

exports.validateLogIn = (user) => {
    const schema = Joi.object({
        email: Joi.string().min(10).max(255).email().required(),
        password: passwordComplexity(complexityOptions).required()
    });

    return schema.validate(user);
};

exports.validateServiceProvider = function validateServiceProvider (user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(55).required(),
        email: Joi.string().min(10).max(255).email().required(),
        password: passwordComplexity(complexityOptions).required(),
        age: Joi.number().min(16).max(100).required(),
        nationalID : Joi.string().min(14).max(28).required(),
        phone_number: Joi.string().min(13).max(18).required(),
        gender : Joi.string().required(),
        username: Joi.string().required(),
        category: Joi.string().required(),
        description: Joi.string().min(20).max(1024).required(),
        price: Joi.number().required(),
    });
    return schema.validate(user);
};