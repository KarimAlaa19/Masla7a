const express = require('express');
const { getAllServiceProviders,
    getUser,
    getAllCustomers,
    deleteUser } = require('../controllers/admin');
const { extractingToken } = require('../controllers/user-auth');
const adminCategoryRouter = require('./admin_routes/admin_category_routes');



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
router.use('/categories', adminCategoryRouter)


module.exports = router;
