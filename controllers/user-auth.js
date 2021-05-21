const User = require("../models/user-model");
const Customer = require("../models/customer-model");
const Category = require('../models/category-model');
const ServiceProvider = require("../models/service-provider-model");
const validator = require("../validators/user-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const multerConfig = require("../images/images-controller/multer");
const cloud = require("../images/images-controller/cloudinary");
const fs = require("fs");

const addUser = async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    if (user.isServiceProvider === false)
      return res
        .status(400)
        .json({ message: "This Email has already registered as customer" });
    else {
      return res.status(400).json({
        message: "This Email has already been registered as Service Provider",
      });
    }
  }
  const used_userName = await User.findOne({ userName: req.body.userName });
  if (used_userName)
    return res
      .status(400)
      .json({ message: "This userName is already used, choose another one" });

  //Creating a User
  user = await User.create(
    _.pick(req.body, [
      "name",
      "email",
      "password",
      "age",
      "nationalID",
      "phone_number",
      "gender",
      "userName",
    ])
  );
  // Reading files
  if (req.files) {
    for (var i = 0; i < req.files.length; i++) {
      if (req.files[i].fieldname === "profilePic") {
        const result = await cloud.uploads(req.files[i].path);
        user.profilePic = result.url;
        fs.unlinkSync(req.files[i].path);
      }
    }
  }
  //Encrypting the password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  console.log(user._id);
  return user;
};

//#region User Sign up
exports.addingUser = async (req, res, next) => {
  //validating the data
  const { error } = validator.validateSignUp(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  let user = await addUser(req, res);
  if (user._id) {
    //Adding as Customer
    const customer = await new Customer({
      userID: user._id,
    });
    await customer.save();
    //Sending genereted token
    let token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(_.pick(user, ["_id", "name", "email", "isServiceProvider"]));
  }
};

//#endregion

//#region Service provider Sign Up
exports.addServiceProvider = async (req, res, next) => {
  const { error } = validator.validateServiceProvider(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  //Adding as User
  let user = await addUser(req, res);
  user.isServiceProvider = true;
  await user.save();
  if (user._id) {
    const category = await Category.findOne({name: req.body.category});
    //Adding as Service Provider
    let serviceProvider = await ServiceProvider.create({
      userID: user._id,
      userName: user.userName,
      description: req.body.description,
      category: category,
      serviceName: req.body.serviceName,
      servicePrice: req.body.servicePrice,
      address: req.body.address,
    });

    if (req.files) {
      for (var i = 0; i < req.files.length; i++) {
        if (req.files[i].fieldname === "gallery") {
          let cloudStr = await cloud.uploads(req.files[i].path);
          serviceProvider.gallery.push(cloudStr.url);
          fs.unlinkSync(req.files[i].path);
        }
      }
    }
    await serviceProvider.save();
    let token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .json({ message: "Successfully you became a service provider" });
  }
};
//#endregion

//#region Extracting Token Data
exports.extractingToken = async (req, res, next) => {
  //getting value from a header by giving its key
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).send("Access denied. No token is avaliable.");
  try {
    //Transfer the data in the token into a meaningful data
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    //Setting the body of the user into the body decoded from the token
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid Token");
  }
};

//#endregion

//#region Login a user by using JWT
exports.authUser = async (req, res, next) => {
  console.log(req.body);

  const { error } = validator.validateLogIn(req.body);
  if (error) return res.status(401).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  let validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = await user.generateAuthToken();

  res.send(token);
};

//#endregion

//#region Getting profile information
exports.getUserInfo = async (req, res , next)=>{
  const userID = req.user._id;
  const user = await User.findById(userID)
  if(!user.isServiceProvider)
  return res.status(401).json({message: 'Not allowed'});

  const userInfo = await User.findById(userID).populate('users').select('name userName profilePic gallery availability gender age')
  console.log(userInfo)
  res.status(200).send(userInfo);
}
//#endregion

//#region change profile picture
exports.changeProfilePic = async (req, res , next)=>{
  const userID = req.user._id;
  const user = await User.findByIdAndUpdate(userID, { profilePic: req.body.profilePic }, {
    new: true
  });
  res.status(200).send(user);
}
//#endregion