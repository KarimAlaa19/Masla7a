const mongoose = require("mongoose");
const _ = require("lodash");
const User = require("../models/user-model");
const Order = require('../models/order-model');

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

exports.getAllServiceProviders = async (req, res) => {

  if (req.params.id.length != 24) return res.status(404).send("Invalid ID");
  const userID = mongoose.Types.ObjectId(req.params.id);

  const serviceProviders = await User
    .find({ role: 'serviceProvider' })
    .populate('serviceId', '-gallery -ordersList -serviceProviderId -categoryId')
    .select('name gender age profilePic userName availability ')

  if (serviceProviders.length === 0)
    return res.status(200).json({ message: 'NO SERVICE PROVIDERS YET' })

  const user = await User.findById(userID);

  serviceProviders.forEach((serviceProvider) => {
    if (user.favouritesList.includes(serviceProvider.serviceId._id)) {
      //console.log('YES')
      serviceProvider.favourite = true
      //console.log(serviceProvider.favourite)
    }
    else {
      //console.log('NO')
      serviceProvider.favourite = false;
      // console.log(serviceProvider.favourite)
    }
  })

  console.log(serviceProviders[0].favourite)

  const obj = [{ name: 'reem', email: 'olaa' }, { name: 'arwa', email: 'plaaa' }]
  obj[0].favourite = false
  console.log(obj)
  return res.status(200).json({ serviceProviders })
}

exports.changeAvailability = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user)
      return res.status(400).json({
        message: 'User Not Found'
      });

    req.body.availability = !req.body.availability ?
      'offline' : req.body.availability;

    user.availability = req.body.availability;

    if (user.role === 'serviceProvider') {
      const orders = await Order.find({ serviceProviderId: user._id });
      orders.forEach(order => {
        if (new Date() >= order.startsAt && new Date() <= order.endsAt) {
          user.availability = 'busy';
        }
      });
    }

    await user.save();

    res.status(202).json({
      status: 'Success',
      user: user
    });

  } catch (err) {
    res.status(500).json({
      messgae: err.message
    });
  }
};
