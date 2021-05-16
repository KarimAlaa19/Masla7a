const express = require('express');
const usersController = require('../controllers/auth');
const conversationControl = require('../controllers/conversation');
const router = express.Router();

router.use(usersController.extractingToken);
router.get('/',conversationControl.fetchAll);

router.get('/:id/messages', conversationControl.fetchMessages);

module.exports = router;