const express = require('express');
const { getUserOrders,createOrder, confirmOrder } = require('../controllers/order-controller');
const { extractingToken } = require('../controllers/user-auth');


const router = express.Router();


router.get('/', extractingToken, getUserOrders);

router.post('/create-order', extractingToken, createOrder);

router.post('/confirm-order', extractingToken, confirmOrder);

module.exports = router;