
const express = require('express');
const { addingUser, authUser, extractingToken, getUserInfo } = require('../controllers/user-auth');
const multerConfig = require("../images/images-controller/multer");
const router = express.Router();

//#region POST a new User with swagger
 /**
  * @swagger
  * /accounts/sign-up:
  *  post:
  *   summary: create User and customer
  *   description: create User and customer for the organisation
  *   requestBody:
  *    content:
  *     application/json:
  *      schema:
  *       $ref: '#/definitions/User'
  *   responses:
  *    200:
  *     description: employee created succesfully
  *    400: 
  *     description: This Email has already registered as customer
  */
 //#endregion
// PATH '/accounts/sign-up'
router.post('/sign-up', multerConfig, addingUser);

//#region POST a new User with swagger
 /**
  * @swagger
  * /accounts/login:
  *  post:
  *   summary: create User and customer
  *   description: create User and customer for the organisation
  *   requestBody:
  *    content:
  *     application/json:
  *      schema:
  *       $ref: '#/definitions/Login'
  *   responses:
  *    200:
  *     description: user logged in succesfully
  *    400: 
  *     description: Invalid email or password
  *    401:
  *     description: Validation error
  */
 //#endregion
//User login............PATH: 'accounts/login
router.post('/login', authUser);


module.exports = router;
