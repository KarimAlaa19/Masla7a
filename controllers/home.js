const User = require("../models/user-model");
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
  return res.status(200).json({serviceProviders})
}
