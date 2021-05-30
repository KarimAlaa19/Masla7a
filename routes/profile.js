
const express = require('express');
const { extractingToken } = require('../controllers/user-auth');
const {getUserInfo, updateProfile, changeProfilePic, resetPassword} = require('../controllers/profile')
const multerConfig = require("../images/images-controller/multer");
const router = express.Router();

//User Profile............PATH: '/my-profile/
router.get('/', extractingToken, getUserInfo);


//User login............PATH: '/my-profile/update-profilePic
router.put('/update-profilePic', extractingToken ,multerConfig, changeProfilePic );


//User login............PATH: '/my-profile/reset-password
router.put('/reset-password', extractingToken, resetPassword );
module.exports = router;
