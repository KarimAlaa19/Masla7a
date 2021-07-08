const express = require('express');
const {test} = require('../controllers/test');
const router = express.Router();


router.get('/test', test);

module.exports = router;