const jwt = require('jsonwebtoken');
const config = require('config');
const Order = require('../models/order-model');
const { validateCreateOrder } = require('../validators/order-validator');
const _ = require('lodash');


exports.createOrder = async (req, res, next) => {
    const { error } = validateCreateOrder(req.body);
    if(error) return res.status(400).json({errorMessage: error.details[0].message});

    try{
        const token = jwt.verify(req.header('x-auth-token'), config.get('jwtPrivateKey'));
        req.body.serviceProviderID = token._id;
        const order = new Order(req.body);

        res.status(200).json({
            orderInfo: order
        });
    } catch(err) {
        res.status(500).json({
            errorMessage: err.message
        })
    }
};


exports.confirmOrder = async (req, res, next) => {
    try{
        if(!req.body.confirm) return res.status(200).json({ message: 'Order Canceled'});

        const token = jwt.verify(req.header('x-auth-token'), config.get('jwtPrivateKey'));
        req.body.customerID = token._id;
        req.body.createdAt = Date.now();

        const order = await Order.create(req.body);
        res.status(201).json({
            orderInfo: order
        });
    } catch(err) {
        res.status(500).json({
            errorMessage: err.message
        })
    }
};