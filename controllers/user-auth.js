
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

//#region handling common functions
const addUser = async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).json({message: `This Email has been registered before as ${user.role}` });
  
    const used_userName = await User.findOne({ userName: req.body.userName });
  
    if (used_userName)
      return res.status(400).json({ message: "This userName is already used, choose another one" });
  
    //Creating a User
    user = await User.create(
      _.pick(req.body, ["name","email","password","age","nationalID","phone_number","gender","userName","address","role"])
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
    return user;
  };
//#endregion 

//#region User Sign up
exports.addingUser = async (req, res, next) => {
  if (!req.body.role)
    return res.status(400).json({ message: "ROLE DATA IS MISSING" });

  let user;

  //Normal User Handling
  if (req.body.role === "customer") {
    const { error } = validator.validateSignUp(req.body);
    if (error)
    return res.status(400).json({ message: error.details[0].message });

    user = await addUser(req, res);
  }
  
  //Service Provider and Service Handling
  if (req.body.role === "serviceProvider") {
    const { error } = validator.validateServiceProvider(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

      user = await addUser(req, res);
      await user.save();

      //Adding service
      const categoryID = await Category.findOne({name: req.body.category});
      const service = await Service({
        serviceName: req.body.serviceName,
        categoryId: categoryID,
        serviceProviderId: user._id,
        servicePrice: req.body.servicePrice,
        description: req.body.description
      }).save();

      if (req.files) {
        for (var i = 0; i < req.files.length; i++) {
          if (req.files[i].fieldname === "gallery") {
            let cloudStr = await cloud.uploads(req.files[i].path);
            service.gallery.push(cloudStr.url);
            fs.unlinkSync(req.files[i].path);
          }
        }
      }
      await service.save();
      }
  //Sending genereted token
  let token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email", "isServiceProvider"]));
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
exports.getUserInfo = async (req, res, next) => {
  const userID = req.user._id;
  const user = await User.findById(userID);
  if (!user.isServiceProvider)
    return res.status(401).json({ message: "Not allowed" });

  const userInfo = await User.findById(userID)
    .populate("users")
    .select("name userName profilePic gallery availability gender age");
  console.log(userInfo);
  res.status(200).send(userInfo);
};
//#endregion

//#region change profile picture
exports.changeProfilePic = async (req, res, next) => {
  const userID = req.user._id;
  const user = await User.findByIdAndUpdate(
    userID,
    { profilePic: req.body.profilePic },
    {
      new: true,
    }
  );
  res.status(200).send(user);
};
//#endregion
