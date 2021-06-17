const _ = require("lodash");
const Order = require("../models/order-model");
const Service = require("../models/service-model");
const { validateCreateOrder } = require("../validators/order-validator");
// const mongoose = require("mongoose");

exports.getUserOrders = async (req, res) => {
  try {

    if (req.user.role !== "customer")
      return res
        .status(400)
        .json({ message: "There is no orders fo non customer" });
    let orders;

    if (req.user.role === "customer") {
      orders = await Order.find({ customerId: req.user._id }).populate(
        "customerId"
      );
    } else {
      orders = await Order.find({ serviceProviderId: req.user._id }).populate(
        "serviceProviderId"
      );
    }

    if (orders.length === 0)
      return res.status(200).json({
        message: "You Didn't Make Any Order Yet",
      });

    res.status(200).json({
      ordersCount: orders.length,
      orders: orders,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.createOrder = async (req, res) => {
  const { error } = validateCreateOrder(req.body);
  if (error)
    return res.status(400).json({ errorMessage: error.details[0].message });

  try {
    req.body = _.pick(req.body, [
      "customerId",
      "serviceProviderId",
      "orderDate",
      "startsAt",
      "endsAt",
      "price",
      "address",
    ]);

    if (req.body.startsAt > req.body.endsAt)
      return res.status(400).json({
        message: 'The Time To Start The Order Is Earlier Than Th Time To End It'
      });

    const service = await Service.findOne({
      serviceProviderId: req.body.serviceProviderId,
    });

    req.body.serviceName = service.serviceName;

    const checkSPOrders = await Order.findOne({
      serviceProviderId: req.body.serviceProviderId,
      orderDate: req.body.orderDate,
      $or: [
        {
          startsAt: {
            $gte: req.body.startsAt,
            $lte: req.body.endsAt,
          },
        },
        {
          endsAt: {
            $gte: req.body.startsAt,
            $lte: req.body.endsAt,
          },
        },
      ],
    });

    if (checkSPOrders)
      return res.status(400).json({
        message: "The Service Provider Has Order At This Time",
      });

    const order = await Order.create(req.body);

    service.ordersList.push(order._id);

    await service.save();

    res.status(201).json({
      orderInfo: _.pick(order, [
        "serviceName",
        "orderDate",
        "startsAt",
        "endsAt",
        "price",
        "address",
      ]),
    });
  } catch (err) {
    res.status(500).json({
      errorMessage: err.message,
    });
  }
};

{
  // exports.createOrder = async (req, res, next) => {
  //     const { error } = validateCreateOrder(req.body);
  //     if (error) return res.status(400).json({ errorMessage: error.details[0].message });
  //     try {
  //         const token = jwt.verify(req.header('x-auth-token'), config.get('jwtPrivateKey'));
  //         req.body.serviceProviderID = token._id;
  //         req.body.serviceName = (await ServiceProvider.
  //             findById(token_id).
  //             select('serviceName').
  //             populate('serviceName')).serviceName;
  //         const order = new Order(req.body);
  //         res.status(200).json({
  //             orderInfo: order
  //         });
  //     } catch (err) {
  //         res.status(500).json({
  //             errorMessage: err.message
  //         })
  //     }
  // };
  // exports.confirmOrder = async (req, res, next) => {
  //     try {
  //         if (!req.body.confirm) return res.status(200).json({ message: 'Order Canceled' });
  //         const token = jwt.verify(req.header('x-auth-token'), config.get('jwtPrivateKey'));
  //         req.body.customerID = token._id;
  //         req.body.createdAt = Date.now();
  //         const order = await Order.create(req.body);
  //         res.status(201).json({
  //             orderInfo: order
  //         });
  //     } catch (err) {
  //         res.status(500).json({
  //             errorMessage: err.message
  //         })
  //     }
  // };
}
