const User = require("../models/user-model");

exports.homePage = async (req, res) => {

    const users = await User.find()
      .populate("users");
    res.status(200).json({ users });
  };
  