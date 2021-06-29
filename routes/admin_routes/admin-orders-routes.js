const express = require('express');
const { getOrdersAdmin } = require('../../controllers/order-controller');


const router = express.Router();


router.get('/', getOrdersAdmin);


module.exports = router;