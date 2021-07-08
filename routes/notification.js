const express = require('express');
const { fetchAllNotifications, numberOfUnseen, sendNotification,subscribe, unsubscribe } = require('../controllers/notification');
const { extractingToken } = require('../controllers/user-auth');
const router = express.Router();

//Get IN-APP Notifications
router.get('/', extractingToken, fetchAllNotifications);

//Get Number Of Unseen Notifications
router.get('/unseen-count', extractingToken, numberOfUnseen);

module.exports = router;


