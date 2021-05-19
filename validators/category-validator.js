const Joi = require('joi');


exports.validateCategory = (category) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(55).required()
    });

    return schema.validate(category);
};