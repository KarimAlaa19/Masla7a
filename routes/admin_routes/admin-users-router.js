const express = require('express');
const { getUser,
    deleteUser } = require('../../controllers/admin');

const { getNewUswes,
    getActiveCustomers,
    getAllUsersRole,
    getTopServiceProviders,
    getAllCustomers,
    getAllServiceProviders } = require('../../controllers/admin-controllers/admin-users-controller');


const router = express.Router();


//Path /admin/control/users/user/:id
router.get('/user/:id', getUser);

//Path /admin/control/users/delete/:id
router.delete('/user/delete/:id', deleteUser);


//          General User Routes

//Path /admin/control/users/new-users
router.get('/new-users', getNewUswes);

//Path /admin/control/users/total-users-roles
router.get('/total-users-roles', getAllUsersRole);


//          Customers Routes

//Path /admin/control/users/customers
router.get('/customers', getAllCustomers);

//Path /admin/control/users/active-customers
router.get('/active-customers', getActiveCustomers);


//          Service Providers Routes

//Path /admin/control/users/service-providers
router.get('/service-providers', getAllServiceProviders);

//Path /admin/control/users/top-service-providers
router.get('/top-service-providers', getTopServiceProviders);


module.exports = router;