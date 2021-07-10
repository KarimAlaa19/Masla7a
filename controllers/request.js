
const User = require("../models/user-model");
const Service = require("../models/service-model");
const {Request} = require("../models/requests");
const {Notification} = require("../models/notification");
const mongoose = require("mongoose");
const _ = require("lodash");

exports.postRequest = async (req, res) => {
  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");

  const serviceProviderID = mongoose.Types.ObjectId(req.params.id);
  const serviceProvider = await User.findById(serviceProviderID)
  const service = await Service.findOne({serviceProviderId: serviceProviderID,});
  
  if (!service)
    return res.status(400).json({ message: "There is no service provider with such ID" });

  const customer = await User.findById(req.user._id);
  
  const request = await new Request({
      customerId: customer._id,
      serviceProviderId: serviceProviderID,
      serviceName: service.serviceName,
      status: 'pending'
  });
  await request.save();
  
  try{
    //Saving in-app notification for the request
    const notification = await new Notification({
        title: "New Request",
        body: `User ${customer.name} Wants To Use Your Service ${ service.serviceName}`,
        senderUser: customer._id,
        targetUsers:  serviceProviderID,
        subjectType: "Request",
        subject: request._id,
      })
      await notification.save();

    //push firebase notification
    await serviceProvider.user_send_notification(
        notification.toFirebaseNotification()
      );

  }catch(err){
    console.log(err)
  }
  return res.status(200).json('Successfully Send A Request')

};

exports.getAllRequests = async (req, res) => {
  
};
