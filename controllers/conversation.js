const { Conversation } = require("../models/conversation");
const { Message } = require("../models/messages");
const _ = require("lodash");
const mongoose = require('mongoose')
 //status

exports.fetchAll = async (req, res, next) => {
  const conversations = await Conversation.find(
    { users: req.user._id }
  ).populate('users lastMessage','name profilePic availability user content createdAt')
  .sort('-updatedAt')
  .select('-createdAt -updatedAt')
  res.status(200).json(conversations);
}; 

exports.fetchMessages = async (req, res, next) => {

  if(req.body.id.length != 24 )
  return res.status(404).json("Invalid ID");

  const conversationID = mongoose.Types.ObjectId(req.body.id)
  const conversation = await Conversation.findById(conversationID);
  if (!conversation)
    return res.status(404).json("No conversation with such ID");

  const messages = await Message.find(
    {
      conversation: conversationID,
    }
  ).populate('user', 'name profilePic')
  .select('content attachment createdAt')
  .sort('-createdAt');

  res.status(200).json(messages);
};

exports.deleteConversation = async(req, res, next)=>{
  if (req.params.id.length != 24) return res.status(404).json("Invalid ID");

  const conversationID = mongoose.Types.ObjectId(req.params.id);
  const conversation = await Conversation.findById(conversationID);
  
  if(!conversation)
  return res.status(400).json({message :'There Is No conversation With Such ID'});

  
 await conversation.remove();
  res.status(200).json({message: 'Deleted Successfully'})
}
