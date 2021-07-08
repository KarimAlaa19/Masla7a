const {Notification} = require('../models/notification');
const notificationService = require('../services/notification')
const User = require('../models/user-model');
const _ = require("lodash");

exports.fetchAllNotifications = async (req, res) => {
  const user = req.user;

  let notifications = await Notification.find({
    targetUsers: { $in: [user._id] },
  })
    .sort("-createdAt")
    .populate("subject");

  for (let i = 0; i < notifications.length; i++) {
    let notification = _.cloneDeep(notifications[i]); 
    if (notification.seen) continue;
    notification.seen = true;
    await notification.save();
  }
  return res.statu(200).json({notifications: notifications});
};

exports.numberOfUnseen = async (req, res)=>{
    const user = req.user
    const numberOfUnseen = await Notification.countDocuments({
        targetUsers: user._id,
        seen: false
    });

    return res.status(200).json({
        unseenCount : numberOfUnseen
    })
}

exports.sendNotification = async (req, res)=>{
    const deviceToken = req.body.deviceToken;
    const message = {
        notification:{
            title: req.body.title,
            body: req.body.title
        }
    }
    await notificationService.firebaseSendNotification(deviceToken, message);
}

exports.subscribe = async (req,res)=>{
  const user = await User.findById(req.user._id);
  const token = req.body.deviceToken

  if(token){
    const index = _.findKey(
      user.pushTokens,
      _.matchesProperty("deviceToken", token)
    );
    if(index===undefined){
      user.pushTokens.push({
        deviceToken: token
      })
    }
  }
  await user.save();
  return res.status(200).json({user})
}

exports.unsubscribe = async (req, res)=>{
  const user = await User.findById(req.user._id);
  const token = req.body.deviceToken

  if(token){
    const index = _.findKey(
      user.pushTokens,
      _.matchesProperty("deviceToken", token)
    );
    if(index!==undefined){
      user.pushTokens.splice(index,1);
    }
  }
  await user.save();
  return res.status(200).json({user})
}