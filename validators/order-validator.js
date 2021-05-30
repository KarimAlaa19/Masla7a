const Joi = require('joi');

exports.validateCreateOrder = (order) => {
    const schema = Joi.object({
        customerId: Joi.string().required(),
        serviceProviderId: Joi.string().required(),
        serviceName: Joi.string(),
        orderDate: Joi.date().required(),
        startsAt: Joi.date().required(),
        endsAt: Joi.date().required(),
        price: Joi.number().min(5).required(),
        address: Joi.string().required()
    });

    return schema.validate(order);
};