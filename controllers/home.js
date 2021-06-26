const User = require("../models/user-model");

exports.homePage = async (req, res) => {

    const users = await User.find()
      .populate("users")
      .select("name _id userName profilePic role  ");
    res.status(200).json({ users });
  };
  