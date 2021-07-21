const { Conversation } = require("../models/conversation");
const { Message } = require("../models/messages");
const _ = require("lodash");
const mongoose = require('mongoose')
 //status

exports.fetchAll = async (req, res, next) => {
  const conversations = await Conversation.find(
    { users: req.user._id },
    req.allowPagination,
    {
      sort: 'updatedAt',
      populate: [{ path: "users", select: "name profilePic" }, "lastMessage"],
    }
  );
  console.log(conversations)
  res.status(200).json(conversations);
}; 

exports.fetchMessages = async (req, res, next) => {
  if(req.params.id.length != 24 )
  return res.status(404).send("Invalid ID");
  
  const conversationID = mongoose.Types.ObjectId(req.params.id)
  const conversation = await Conversation.findById(conversationID);
  console.log(conversation);
  if (!conversation)
    return res.status(404).send("No conversation with such ID");

  const messages = await Message.find(
    req.allowPagination,
    {
      conversation: conversationID,
    }
  ).populate('user', 'name profilePic')
  .select('content attachment')
  .sort('-createdAt');
  console.log(messages)
  res.status(200).send(messages);
};
