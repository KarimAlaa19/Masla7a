const Joi = require('joi');


exports.validateCreateCategory = (category) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(55).required(),
        icon: Joi.string().required(),
        coverPhoto: Joi.string().required(),
    });

    return schema.validate(category);
};


exports.validateEditCategory = (category) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(55),
        icon: Joi.string(),
        coverPhoto: Joi.string(),
    });

    return schema.validate(category);
};