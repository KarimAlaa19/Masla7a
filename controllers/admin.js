const User = require("../models/user-model");
const mongoose = require("mongoose");

exports.getAllServiceProviders = async (req, res, next) => {
  console.log(req.user);
  if (!req.user.isAdmin)
    return res.status(401).json({ message: "Unauthorized Admin" });

  const serviceProviders = await User.find({ isServiceProvider: true })
    .populate('users')
    .select("name _id userName profilePic ");
  res.status(200).json({ result: serviceProviders });
};

exports.getUser = async (req, res, next) => {
  if (!req.user.isAdmin)
  return res.status(401).json({ message: "Unauthorized Admin" });

  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");

  const serviceProviderID = mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(serviceProviderID);

  res.status(200).json({ result: user });
};

exports.deleteUser = async (req, res, next)=>{
  if (!req.user.isAdmin)
  return res.status(401).json({ message: "Unauthorized Admin" });

  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");

  const user = await User.findByIdAndRemove(userID);
  if (!user)
    return res.status(400).json({ message: "There is no User with such ID" });

  
  res.status(200).json({ message: 'User deleted successfully' });
}

exports.getAllCustomers = async (req, res , next)=>{
  if (!req.user.isAdmin)
    return res.status(401).json({ message: "Unauthorized Admin" });

  const serviceProviders = await User.find({isServiceProvider: false, isAdmin: false})
    .populate('users')
    .select("name _id userName profilePic ");
  res.status(200).json({ result: serviceProviders });
}

