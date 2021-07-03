const User = require("../models/user-model");
const Service = require("../models/service-model");
const Review = require("../models/review");
const Category = require("../models/category-model");
const validator = require("../validators/user-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const cloud = require("../images/images-controller/cloudinary");
const fs = require("fs");

//#region Getting profile information
exports.getUserInfo = async (req, res, next) => {
  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");

  const userID = mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(userID);
  if (!user)
    return res.status(400).json({ message: "There is no User with such ID " });
  if (user.role !== "serviceProvider")
    return res.status(401).json({ message: "Not allowed" });

  const userInfo = await User.findById(userID)
    .populate("users")
    .select("name userName profilePic gallery availability gender age");
  const service = await Service.findOne({ serviceProviderId: userID })
    .populate("services")
    .select("serviceName servicePrice description gallery averageRating numberOfRatings");
  const reviews = await Review.find({ serviceID: service._id })
    .populate("user", "name profilePic -_id")
    .select("title content rating _id");
  res.status(200).json({ serviceProviderInfo: userInfo, service: service , reviewsDetails: reviews});
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
  res.status(200).json({ user: user });
};
//#endregion

//#region change profile picture
exports.updateProfile = async (req, res, next) => {
  const userID = req.user._id;
  const user = await User.updateOne(userID, req.body);
  res.status(200).send(user);
};
//#endregion

//#region reset password
exports.resetPassword = async (req, res, next) => {
  const userID = req.user._id;
  const user = await User.findById(userID);

  const { error } = validator.validateResetPassword(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  let validPassword = await bcrypt.compare(
    req.body.current_password,
    user.password
  );
  if (!validPassword)
    return res.status(400).json({ message: "Invalid password" });

  let checkNewPassword = await bcrypt.compare(
    req.body.new_password,
    user.password
  );
  if (checkNewPassword)
    return res
      .status(400)
      .json({
        message:
          "This new password is the same as your current password, Please change it",
      });

  if (req.body.new_password != req.body.confirm_password)
    return res
      .status(400)
      .json({ message: "Confirm Password doesnt match new password" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.new_password, salt);
  await user.save();
  res
    .status(200)
    .json({ message: "You have successfully changed your password" });
};
//#endregion

//#region Add photos in the gallery
exports.addIntoGallery = async (req, res, next) => {
  const userID = req.user._id;
  const user = await User.findById(userID);
  const service = await Service.findOne({ serviceProviderId: userID });
  if (req.files) {
    for (var i = 0; i < req.files.length; i++) {
      if (req.files[i].fieldname === "gallery") {
        let cloudStr = await cloud.uploads(req.files[i].path);
        service.gallery.push(cloudStr.url);
        await service.save();
        fs.unlinkSync(req.files[i].path);
      }
    }
  }
  res.status(200).json({ user: user });
};
//#endregion

