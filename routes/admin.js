
const express = require('express');
const adminController = require('../controllers/admin');
const authcontroller = require('../controllers/user-auth');
const adminCategoryRouter = require('./admin_routes/admin_category_routes')
const router = express.Router();

router.use(authcontroller.extractingToken);

//Path /admin/control/service-providers
router.get('/service-providers', adminController.getAllServiceProviders);

//Path /admin/control/user/:id
router.get('/user/:id', adminController.getUser);

//Path /admin/control/customers
router.get('/customers',adminController.getAllCustomers);

//Path /admin/control/delete/:id
router.delete('/user/delete/:id',adminController.deleteUser);

//adding service....


router.use('/categories', adminCategoryRouter)


module.exports = router;
