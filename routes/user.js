const express = require('express');
const usersController = require('../controllers/auth');
const multerConfig = require("../images/images-controller/multer");
const router = express.Router();


//POST a new User
// PATH '/user/sign-up'
router.post('/sign-up', multerConfig ,usersController.addingUser);

//Adding a service provider..........PATH:'user/service_provider/sign_up'
router.post('/service_provider/sign_up', multerConfig , usersController.addServiceProvider);

//User login............PATH: 'user/login
router.post('/login',usersController.authUser);

module.exports = router;
