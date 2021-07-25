const socketIO = require("socket.io");
const socketIOJwt = require("socketio-jwt");
const mongoose = require("mongoose");
const { Conversation } = require("./models/conversation");
const { Notification } = require("./models/notification");
const Message = require("./models/messages").Message;
const User = require("./models/user-model");
const Order = require("./models/order-model");
const multerconfig = require("./images/images-controller/multer");
const cloud = require("./images/images-controller/cloudinary");
const config = require("config");
const fs = require("fs");

const socketServer = (server) => {
  try {
    const io = socketIO(server);

    //#region socket nameSpace and Athenticating
    const nameSpace = io.of("/chatting");
    nameSpace.on(
      "connection",
      socketIOJwt.authorize({
        secret: config.get("jwtPrivateKey"),
      }),
      (socket) => {
        socket.emit("Hello from rim, you have connected successfully");
      }
    );
    //#endregion

    //Authenticate event
    nameSpace.on("authenticated", async (socket) => {
      console.log("successfuly authenticated");

      //#region Extracting sender id and joining a room
      const senderID = socket.decoded_token._id;
      await socket.join(`user ${senderID}`);
      socket.emit("hello", "Hello from rim, you have connected successfully");
      //#endregion

      //Private event
      socket.on("private", async (data) => {
        console.log(data);
        if (!data.content && !data.attachment && !data.type) return;
        const senderID = socket.decoded_token._id;

        //#region Return conversation if there is and create one if there isn't
        console.log("hello");
        let conversation = await Conversation.findOne({
          $or: [{ users: [senderID, data.to] }, { users: [data.to, senderID] }],
        });

        //Create a conversation if there isn't
        if (!conversation) {
          conversation = await new Conversation({
            users: [senderID, data.to],
          });
          await conversation.save();
        }
        //#endregion

        console.log(typeof senderID);
        const sender = await User.findById(mongoose.Types.ObjectId(senderID));
        let emittedData;
        let sentMessage;
        if (data.type !== "order") {
          //#region saving messages to the Database
          sentMessage = await new Message({
            user: senderID,
            content: data.content,
            attachment: data.attachment,
            type: data.type,
            conversation: conversation._id,
          });
          await sentMessage.save();

          console.log(sentMessage._id);
          conversation.lastMessage = await sentMessage._id;
          await conversation.save();

          //Recieving files
          socket.on("files", multerconfig, async (req, res) => {
            if (req.files) {
              if (req.files[i].fieldname === "image") {
                const result = await cloud.uploads(req.files[i].path);
                sentMessage.attachment = result.url;
                fs.unlinkSync(req.files[i].path);
                await sentMessage.save();
                // user.profilePic = result.url;
                res.status(200).json("Successfully uploaded an image");
              }
            }
          });

          emittedData = {
            messageID: sentMessage._id,
            content: data.content,
            sender: senderID,
            type: data.type,
            createdAt: sentMessage.createdAt,
            role: sender.role,
          };
        }
        //#endregion

        //#region Emmitting order data for forms
        else {
          let serviceProviderID;
          let customerID;
          if (sender.role === "serviceProvider") {
            serviceProviderID = sender._id;
            customerID = data.to;
          } else {
            serviceProviderID = data.to;
            customerID = sender._id;
          }
          const order = await Order.findOne({
            serviceProviderId: serviceProviderID,
            customerId: customerID,
          })
            .sort("-createdAt")
            .select(
              "-serviceProviderId -customerId -serviceId -notes -status "
            );
          if (!order) return;
          emittedData = { order, role: sender.role };
        }
        //#endregion
        nameSpace
          .to(`user ${data.to}`)
          .to(`user ${senderID}`)
          .emit("new-message", emittedData);
        console.log(emittedData);

        //#region  Send Notification
        //in-app Notification
        const receiver = await User.findById(data.to);
        if (sentMessage) {
          const notification = await new Notification({
            title: "New Message",
            body: data.content,
            senderUser: senderID,
            targetUsers: data.to,
            subjectType: "Message",
            subject: sentMessage._id,
          }).save();
          // push notifications
          await receiver.user_send_notification(
            notification.toFirebaseNotification()
          );
        }

        //#endregion
        console.log("CHECK POINT WOOHOOO..");
      });
      socket.on("decline", async (data) => {
        if (!data.to) {
          console.log("Receiver ID Should be sent");
          return;
        }
        const senderID = socket.decoded_token._id;
        const sender = await User.findById(mongoose.Types.ObjectId(senderID));
        let serviceProviderID;
        let customerID;
        if (sender.role === "serviceProvider") {
          serviceProviderID = sender._id;
          customerID = data.to;
        } else {
          serviceProviderID = data.to;
          customerID = sender._id;
        }
        console.log(serviceProviderID);
        console.log(customerID);
        const order = await Order.findOneAndRemove({
          serviceProviderId: serviceProviderID,
          customerId: customerID,
          status: "pending",
        }).sort("-createdAt");
        nameSpace
          .to(`user ${data.to}`)
          .to(`user ${senderID}`)
          .emit("new-message", `${sender.name} Declined The Order`);
      });
      socket.on("acceptance", async (data) => {
        if (!data.to) {
          console.log("Receiver ID Should be sent");
          return;
        }
        const senderID = socket.decoded_token._id;
        const sender = await User.findById(mongoose.Types.ObjectId(senderID));
        let serviceProviderID;
        let customerID;
        if (sender.role === "serviceProvider") {
          serviceProviderID = sender._id;
          customerID = data.to;
        } else {
          serviceProviderID = data.to;
          customerID = sender._id;
        }
        nameSpace
          .to(`user ${data.to}`)
          .to(`user ${senderID}`)
          .emit("new-message", `${sender.name} Accepted The Order`);
      });
    });

    return io;
  } catch (error) {
    console.log("error...We are at catch");
  }
};
exports.socketServer = socketServer;
