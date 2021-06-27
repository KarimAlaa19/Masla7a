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
