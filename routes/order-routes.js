const express = require('express');
const orederController = require('../controllers/orderController');


const router = express.Router();


router.post('/create-order', orederController.createOrder);

router.post('/confirmOrder', orederController.confirmOrder);

module.exports = router;