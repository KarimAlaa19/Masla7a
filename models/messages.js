const mongoose = require('mongoose')
const config = require('config')
const jwt = require('jsonwebtoken')
const pagination = require('mongoose-paginate-v2')

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    content: {
      type: String,
    },
    attachment: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.set("toJSON", {
    virtuals: true,
    transform: function (document) {
      return {
        id: document.id,
        content: document.content,
        attachment: document.attachment,
        user: document.user,
        conversation: document.conversation,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    },
  });

messageSchema.plugin(pagination);

const Message = mongoose.model("Message", messageSchema);

exports.Message = Message
