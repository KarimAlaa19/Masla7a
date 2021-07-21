const User = require("../models/user-model");
const Complaint = require('../models/complaint');
const Validator = require('../validators/complaint-validator');
const mongoose = require("mongoose");
const _ = require("lodash");

exports.homePage = async (req, res) => {
  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");

  const userID = mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(userID);
  if (!user)
    return res.status(400).json({ message: "There is no User with such ID " });


  const userInfo = await User.findById(userID)
    .populate("users")
    .select("name userName profilePic location");

  res.status(200).json({ user: userInfo });
};

exports.getAllServiceProviders = async (req, res)=>{

  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");
  const userID = mongoose.Types.ObjectId(req.params.id);

  const serviceProviders = await User
  .find({role:'serviceProvider'})
  .populate('serviceId','-gallery -ordersList -serviceProviderId -categoryId')
  .select('name gender age profilePic userName availability ')
  
  if(serviceProviders.length===0)
  return res.status(200).json({message:'NO SERVICE PROVIDERS YET'})

  const user= await User.findById(userID);

    serviceProviders.forEach( (serviceProvider)=>{
    if(user.favouritesList.includes(serviceProvider.serviceId._id)){
      //console.log('YES')
      serviceProvider.favourite = true
      //console.log(serviceProvider.favourite)
    }
    else{
      //console.log('NO')
      serviceProvider.favourite= false;
     // console.log(serviceProvider.favourite)
    }
  })
  
  console.log(serviceProviders[0].favourite)

  const obj = [{name:'reem', email:'olaa'},{name:'arwa',email:'plaaa'}]
  obj[0].favourite = false 
  console.log(obj)
  return res.status(200).json({serviceProviders})
}

//#region Posting A Complaint
exports.postComplaint = async (req, res)=>{
  const complainant = req.user;
  if(complainant.role !=='customer')
  return res.status(401).json('This Section Is Only For Customers Complaints');

  const {error} = await Validator.validateComplaint(req.body);
  if(error) return res.status(400).json(error.details[0].message);

  const serviceProvider = await User.findOne({userName: req.body.userName});
  const previousComplaint = await Complaint.findOne({serviceProvider:serviceProvider._id, user:complainant._id})
  
  const complaint = new Complaint({
    serviceProvider: serviceProvider._id,
    user: complainant._id,
    complaintType: req.body.complaintType,
    description: req.body.description
  });
  await complaint.save();
  return res.status(200).json({message:'Complaint Has Been Submited Successfully'});
}
//#endregion
