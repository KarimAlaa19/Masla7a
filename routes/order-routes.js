const express = require('express');
const { getUserOrders,createOrder } = require('../controllers/order-controller');
const { extractingToken } = require('../controllers/user-auth');


const router = express.Router();


router.get('/', extractingToken, getUserOrders);

router.post('/create-order', createOrder);

module.exports = router;