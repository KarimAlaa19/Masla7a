const User = require("../models/user-model");

exports.homePage = async (req, res) => {

    const users = await User.find({ role: { $ne: 'admin' } })
      .populate("users")
      .select("-password");
    res.status(200).json({users: users });
  };
  