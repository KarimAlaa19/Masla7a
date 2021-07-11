const Joi = require('joi');

exports.validateOffer = (offer) => {
    const schema = Joi.object({
        percentage: Joi.number().required(),
        daysValidFor: Joi.number().required(),
    });

    return schema.validate(offer);
};