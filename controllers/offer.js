const Offer = require("../models/offers");
const Order = require("../models/order-model");
const User = require("../models/user-model");
const service = require("../models/service-model");
const {validateOffer} = require("../validators/offer-validator");

exports.addAnOffer = async (req, res) => {
  const serviceProvider = await User.findById(req.user._id)
    .populate("serviceId", "serviceName servicePrice _id")
    .select("name profilePic _id");

  const { error } = await validateOffer(req.body);
  if (error) return res.status(400).json(error.details[0].message);

//   let offer = await new Offer.findOne({serviceProvider:serviceProvider._id})
//   if(offer)
//   return res.status(400).json('You already have an offer')

  const expiryDate = new Date();
   expiryDate.setDate(expiryDate.getDay() + 32)
  console.log(new Date())
  console.log(expiryDate)
   offer = await new Offer({
      service: serviceProvider.serviceId._id,
      serviceProvider: serviceProvider._id,
      percentage: req.body.percentage,
      daysValidFor : req.body.daysValidFor,
      expiryDate : expiryDate
  })
  await offer.save();
  res.status(200).json(offer);
};
