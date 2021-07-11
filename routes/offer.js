const express = require('express');
const { addAnOffer } = require('../controllers/offer');
const {extractingToken } = require('../controllers/user-auth')

const router = express.Router();

router.post('/', extractingToken, addAnOffer);

module.exports = router;