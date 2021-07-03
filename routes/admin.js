const express = require('express');
const { extractingToken } = require('../controllers/user-auth');
const adminUserRouter = require('./admin_routes/admin-users-router');
const adminCategoryRouter = require('./admin_routes/admin-category-routes');
const adminOrdersRouter = require('./admin_routes/admin-orders-routes');


const router = express.Router();


router.use(extractingToken);


//admin user routes /admin/control/users
router.use('/users', adminUserRouter)

//admin category routes /admin/control/categories
router.use('/categories', adminCategoryRouter);

//admin/control/orders
router.use('/orders', adminOrdersRouter);


module.exports = router;
