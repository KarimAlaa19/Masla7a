
const express = require('express');
const { extractingToken } = require('../controllers/user-auth');
const { getAllServiceReviews, postServiceReview, deleteMyReview, updateMyReview } = require('../controllers/reviews')
const { getUserInfo,updateProfile,changeProfilePic,resetPassword,addIntoGallery } = require('../controllers/profile')
const multerConfig = require("../images/images-controller/multer");
const router = express.Router();

//User Profile............PATH: '/my-profile/:id
router.get('/:id', extractingToken, getUserInfo);


//User login............PATH: '/my-profile/update-profilePic
router.put('/update-profilePic', extractingToken, multerConfig, changeProfilePic);


//User reset password............PATH: '/my-profile/reset-password
router.put('/reset-password', extractingToken, resetPassword);

//User addd photos to gallery............PATH: '/my-profile/gallery/add-photos
router.post('/gallery/add-photos', extractingToken, multerConfig, addIntoGallery);

//Get all reviews............PATH: '/my-profile/:id/reviews
router.get('/:id/reviews', extractingToken, getAllServiceReviews);

//Get all reviews............PATH: '/my-profile/:id/reviews
router.post('/:id/reviews', extractingToken, postServiceReview);

//Update my review............PATH: '/my-profile/reviews/:id
router.put('/reviews/:id', extractingToken, updateMyReview);

//Delete my review............PATH: '/my-profile/reviews/:id
router.delete('/reviews/:id', extractingToken, deleteMyReview);

module.exports = router;
