
const User = require("../models/user-model");
const Service = require("../models/service-model");
const Category = require("../models/category-model");
const validator = require("../validators/user-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const cloud = require("../images/images-controller/cloudinary");
const fs = require("fs");


//#region Getting profile information
exports.getUserInfo = async (req, res, next) => {
  const userID = req.user._id;
  const user = await User.findById(userID);
  if (user.role!=='serviceProvider')
    return res.status(401).json({ message: "Not allowed" });

  const userInfo = await User.findById(userID)
    .populate("users")
    .select("name userName profilePic gallery availability gender age");
  console.log(userInfo);
  res.status(200).json({result: userInfo});
};
//#endregion

//#region change profile picture
exports.changeProfilePic = async (req, res, next) => {
  const userID = req.user._id;
  const user = await User.findById(userID);
  if (req.files) {
    for (var i = 0; i < req.files.length; i++) {
      if (req.files[i].fieldname === "profilePic") {
        const result = await cloud.uploads(req.files[i].path);
        user.profilePic = result.url;
        fs.unlinkSync(req.files[i].path);
      }
    }
  }
  res.status(200).send(user);
};
//#endregion


//#region change profile picture
exports.updateProfile = async (req, res, next) => {
    const userID = req.user._id;
    const user = await User.updateOne(
      userID,req.body
    );
    res.status(200).send(user);
  };
  //#endregion
  
//#region reset password
exports.resetPassword = async (req, res, next) => {
  const userID = req.user._id;
  const user = await User.findById(userID);
 
  const { error } = validator.validateResetPassword(req.body);
  if (error)return res.status(400).json({ message: error.details[0].message });

  let validPassword = await bcrypt.compare(req.body.current_password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  if(req.body.new_password != req.body.confirm_password)
  return res.status(400).json({message: 'Confirm Password doesnt match new password'});

  const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.new_password, salt);
    await user.save();
  res.status(200).json({message : 'You have successfully changed your password'});
};
//#endregion
