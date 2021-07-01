const Joi = require('joi');


exports.validateCategory = (category) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(55).required(),
        icon: Joi.string().required(),
        coverPhoto: Joi.string().required(),
    });

    return schema.validate(category);
};