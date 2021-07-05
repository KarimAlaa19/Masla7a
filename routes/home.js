const express = require('express');
const { homePage , getAllServiceProviders} = require('../controllers/home');

const { topServiceProviders, filterServices } = require('../controllers/serviceProvider-controller');


const router = express.Router();

router.get('/top-workers', topServiceProviders);

router.get('/search', filterServices);

router.get('/:id', homePage);

router.get('/service-providers/:id', getAllServiceProviders);


module.exports = router;