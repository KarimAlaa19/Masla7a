const socketIO = require("socket.io");
const socketIOJwt = require("socketio-jwt");
const { Conversation } = require("./models/conversation");
const {Notification} = require('./models/notification');
const Message = require("./models/messages").Message;
const User = require("./models/user-model");
const config = require("config");

const socketServer = (server) => {
  try {
    const io = socketIO(server);

    const nameSpace = io.of("/chatting");
    nameSpace.on(
      "connection",
      socketIOJwt.authorize({
        secret: config.get("jwtPrivateKey"),
      }),
      (socket)=>{
      socket.emit('Hello from rim, you have connected successfully')
      }
    );


    nameSpace.on("authenticated", async (socket) => {
      console.log("successfuly authenticated");
      const senderID = socket.decoded_token._id;
      
      await socket.join(`user ${senderID}`);

      socket.emit("hello",'Hello from rim, you have connected successfully')
      socket.on("private", async (data) => {
        
        console.log(data)
        if (!data.content && !data.attachment) return;
        const senderID = socket.decoded_token._id;

        console.log('hello')
        let conversation = await Conversation.findOne({
          $or: [{ users: [senderID, data.to] }, { users: [data.to, senderID] }],
        });

        console.log(conversation)
        //Create a conversation if there isn't
        if (!conversation) {
          console.log('hello we are at new conversation')
          conversation = await new Conversation({
            users: [senderID, data.to],
          });
          console.log('We are converation condition')
          await conversation.save();
        }
        //console.log(conversation);

        //saving messages to the Database
              
        let sentMessage = await new Message({
            user: senderID,
            content: data.content,
            attachment: data.attachment,
            type: data.type,
            conversation: conversation._id,
          });
          await sentMessage.save();
        
          console.log(sentMessage._id)
        conversation.lastMessage = await sentMessage._id;
        await conversation.save();

        const emittedData = {
          content: data.content,
          sender: senderID,
          type: data.type,
          createdAt: sentMessage.createdAt 
        }
        socket.emit("new message", emittedData)
        nameSpace.to(`user ${data.to}`).to(`user ${senderID}`).emit("new-message", emittedData)
        console.log("CHECK POINT WOOHOOO..");
        
          // // Send Notification in-app
          const receiver = await User.findById(data.to)
          const notification = await new Notification({
            title: "New Message",
            body: data.content,
            senderUser: senderID,
            targetUsers:  data.to,
            subjectType: "Message",
            subject: sentMessage._id,
          }).save();

          // push notifications
          await receiver.user_send_notification(notification.toFirebaseNotification());
        
      });
    });
    return io;
  } catch (error) {
    console.log("error...We are at catch");
  }
};
exports.socketServer = socketServer;
