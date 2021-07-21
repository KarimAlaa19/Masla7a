const express = require('express');
const { homePage , postComplaint} = require('../controllers/home');
const { topServiceProviders, filterServices } = require('../controllers/serviceProvider-controller');
const {extractingToken} = require('../controllers/user-auth')

const router = express.Router();

router.get('/top-workers', topServiceProviders);

router.get('/search', filterServices);

router.get('/:id', homePage);

//POST A Complaint PATH /home/complaint
router.post('/complaint',extractingToken, postComplaint);

module.exports = router;