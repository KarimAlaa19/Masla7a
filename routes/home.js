const express = require('express');
const {homePage} = require('../controllers/home');


const router = express.Router();


router.get('/:id', homePage);

module.exports = router;