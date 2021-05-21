
const express = require('express');
const adminController = require('../controllers/admin');
const authcontroller = require('../controllers/user-auth');
const router = express.Router();

router.use(authcontroller.extractingToken);

//Path /admin/control/service-providers
router.get('/service-providers', adminController.getAllServiceProviders);

//Path /admin/control/service-providers/:id
router.get('/user/:id', adminController.getUser);

//Path /admin/control/customers
router.get('/customers',adminController.getAllCustomers);

//Path /admin/control/delete/:id
router.delete('/delete/:id',adminController.deleteUser);

//adding service....
module.exports = router;
