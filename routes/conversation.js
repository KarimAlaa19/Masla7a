const express = require('express');
const usersController = require('../controllers/user-auth');
const conversationControl = require('../controllers/conversation');
const router = express.Router();

router.use(usersController.extractingToken);
router.get('/my-conversations',conversationControl.fetchAll);

router.get('/', conversationControl.fetchMessages);


router.delete('/:id', conversationControl.deleteConversation);

module.exports = router;