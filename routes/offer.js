const express = require('express');
const { addAnOffer, fetchAllOffers } = require('../controllers/offer');
const {extractingToken } = require('../controllers/user-auth')

const router = express.Router();

router.post('/', extractingToken, addAnOffer);
router.get('/', fetchAllOffers);

module.exports = router;