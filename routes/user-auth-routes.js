
const express = require('express');
const { addingUser, addServiceProvider, authUser, extractingToken, getUserInfo } = require('../controllers/user-auth');
const multerConfig = require("../images/images-controller/multer");
const router = express.Router();

//#region Swagger Definitions
/**
 * @swagger
 * definitions:
 *  User:
 *   type: object
 *   properties:
 *    name:
 *     type: string
 *     example: 'john'
 *    email:
 *     type: string
 *     description: date of joining of the employee
 *     example: 'example@yahoo.com'
 *    password:
 *     type: string
 *     description: not less than 8 characters and not more than 64 and must be complex
 *     example: 'Example_5622'
 *    age:
 *     type: integer
 *     description: gender of the employee
 *     example: 23
 *    nationalID:
 *     type: string
 *     description: min length 14 max length 24
 *     example: '11223344556677'
 *    phone_number:
 *     type: integer
 *     description: it is string because it may have characters like '+'
 *     example: '+01222356889'
 *    gender:
 *     type : string
 *     description: gender of the user
 *     example: 'male'
 *    userName:
 *     type: string
 *     description: Username of the user and must be unique
 *     example: 'john123456'
 *  ServiceProvider:
 *   type: object
 *   properties:
 *    name:
 *     type: string
 *    email:
 *     type: string
 *     description: date of joining of the employee
 *     example: '2020-08-30'
 *    password:
 *     type: string
 *     description: not less than 8 characters and not more than 64
 *    age:
 *     type: integer
 *     description: gender of the employee
 *     example: 'male'
 *    nationalID:
 *     type: string
 *    profilePic:
 *     type: string
 *     description: This is of type file
 *     example: 'Software Engineer'
 *    phone_number:
 *     type: integer
 *     description: it is string because it may have characters like '+'
 *    gender:
 *     type: string
 *     description: gender of the employee
 *    username:
 *     type: string
 *     description: Username of the user
 *    gallery:
 *     type: array
 *     items:
 *      type: string
 *     description: array of strings of files uploaded
 *     example: ['str1','str2','str3']
 *    description:
 *     type: string
 *     description: the description of the service provider's skills
 *    category:
 *     type: string
 *    price:
 *     type: integer
 *     description: initial service price
 *  Login:
 *   type: object
 *   properties:
 *    email:
 *     type: string
 *     description: date of joining of the employee
 *     example: 'example@yahoo.com'
 *    password:
 *     type: string
 *     description: not less than 8 characters and not more than 64
 *     example: 'Example_5622'
 */
//#endregion


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

//Adding a service provider..........PATH:'user/service_provider/sign_up'
router.post('/service_provider/sign_up', multerConfig, addServiceProvider);

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


//User login............PATH: 'accounts/my-profile
router.get('/my-profile', extractingToken, getUserInfo);

module.exports = router;
