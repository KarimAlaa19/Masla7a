const User = require("../models/user-model");
const Service = require("../models/service-model");
const Category = require('../models/category-model');
const mongoose = require("mongoose");


exports.getUser = async (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(401).json({ message: "Unauthorized Admin" });

  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");

  const userID = mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(userID);
  if (!user)
    return res.status(400).json({ message: 'There is no user with such ID' })

  res.status(200).json({ result: user });
};

exports.deleteUser = async (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(401).json({ message: "Unauthorized Admin" });

  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");

  const userID = mongoose.Types.ObjectId(req.params.id);
  const user = await User.findByIdAndRemove(req.params.id);
  console.log(user);
  if (!user)
    return res.status(400).json({ message: "There is no User with such ID" });

  if (user.role === 'serviceProvider') {
    const service = await Service.findOneAndRemove({ serviceProviderId: userID })

    const category = await Category.findById(service.categoryId).populate();
    console.log(category.servicesList)
    const index = category.servicesList.indexOf(service._id);
    if (index > -1) {
      category.servicesList.splice(index, 1);
    }
    await category.save();
  }

  res.status(200).json({ message: "User deleted successfully" });
};
