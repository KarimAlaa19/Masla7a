const express = require('express');
const { getRecentOrders } =
    require('../../controllers/admin-controllers/admin-order-controller');


const router = express.Router();

//Path /admin/control/orders/recent-orders
router.get('/recent-orders', getRecentOrders);


module.exports = router;