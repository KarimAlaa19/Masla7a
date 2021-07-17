const express = require('express');
const { getUserOrders,
    getOrder,
    createOrder,
    confirmOrder,
    canceleOrder } = require('../controllers/order-controller');
const { extractingToken } = require('../controllers/user-auth');


const router = express.Router();


router.get('/', extractingToken, getUserOrders);

router.get('/:orderId', extractingToken, getOrder);

router.post('/create-order', extractingToken, createOrder);

router.post('/confirm-order', extractingToken, confirmOrder);

router.put('/cancele-order/:orderId', extractingToken, canceleOrder);

module.exports = router;