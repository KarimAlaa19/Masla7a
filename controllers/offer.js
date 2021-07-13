const {Offer} = require("../models/offers");
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

  console.log(Offer)
  let offer = await Offer.findOne({serviceProvider:serviceProvider._id,status:'Valid'})
  if(offer)
  return res.status(400).json('You already have an offer avaliable')

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 30)

  const expiryDate =new Date(currentDate)
  console.log(typeof expiryDate)
   offer = await new Offer({
      service: serviceProvider.serviceId._id,
      serviceProvider: serviceProvider._id,
      percentage: req.body.percentage,
      daysValidFor : req.body.daysValidFor,
      expireAt : expiryDate
  })
  await offer.save();
  res.status(200).json(offer);
};
