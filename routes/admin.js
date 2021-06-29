const express = require('express');
const { getAllServiceProviders,
    getUser,
    getAllCustomers,
    deleteUser } = require('../controllers/admin');
const { extractingToken } = require('../controllers/user-auth');
const adminCategoryRouter = require('./admin_routes/admin-category-routes');
const adminOrdersRouter = require('./admin_routes/admin-orders-routes');



const router = express.Router();



router.use(extractingToken);

//Path /admin/control/service-providers
router.get('/service-providers', getAllServiceProviders);

//Path /admin/control/user/:id
router.get('/user/:id', getUser);

//Path /admin/control/customers
router.get('/customers', getAllCustomers);

//Path /admin/control/delete/:id
router.delete('/user/delete/:id', deleteUser);

//admin category routes /admin/control/categories
router.use('/categories', adminCategoryRouter);

//admin/control/orders
router.use('/orders', adminOrdersRouter);


module.exports = router;
