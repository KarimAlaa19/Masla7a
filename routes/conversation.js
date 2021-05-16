const express = require('express');
const usersController = require('../controllers/auth');
const conversationControl = require('../controllers/conversation');
const router = express.Router();

router.use(usersController.extractingToken);
router.get('/conversations',conversationControl.fetchAll);

router.get('/conversation/:id/messages', conversationControl.fetchMessages);

module.exports = router;