const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const config = require('config');
const _ = require("lodash");
const Order = require("../models/order-model");
const Service = require("../models/service-model");
const { validateCreateOrder } = require("../validators/order-validator");
const { cleanObj } = require('../utils/filterHelpers');
const { findById } = require("../models/order-model");

exports.getUserOrders = async (req, res) => {
  try {

    if (req.user.role === "admin")
      return res
        .status(400)
        .json({ message: "There is no orders for admins" });

    let orders;

    if (req.user.role === "customer") {
      orders = await Order
        .find({ customerId: req.user._id })
        .populate("customerId");
    } else {
      orders = await Order
        .find({ serviceProviderId: req.user._id })
        .populate("serviceProviderId");
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


exports.getOrder = async (req, res) => {
  try {

    if (req.user.role === "admin")
      return res
        .status(400)
        .json({ message: "There is no orders for admins" });

    const order = await Order
      .findById({ customerId: req.user._id, _id: req.params.orderId })
      .populate("customerId")
      .populate('serviceProviderId');


    if (!order)
      return res.status(200).json({
        message: "You Didn't Make Any Order Yet",
      });

    res.status(200).json({
      order: order,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


exports.getOrdersAdmin = async (req, res) => {

  if (req.user.role !== 'admin')
    return res.status(403).json({
      message: 'Access Denied, Only Admins Can Access This'
    });

  try {

    let queryData = {};

    if (Object.keys(req.query).length > 0) {
      queryData['serviceId.categoryId'] = req.query.category ?
        mongoose.Types.ObjectId(req.query.category) : undefined;
      queryData['status'] = req.query.status;

      cleanObj(queryData);
    }


    console.log(queryData)

    let orders = await Order
      .aggregate()
      .lookup({
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'serviceId'
      })
      .match(queryData)
      .lookup({
        from: 'categories',
        localField: 'serviceId.categoryId',
        foreignField: '_id',
        as: 'category'
      })
      .lookup({
        from: 'users',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customerId'
      })
      .lookup({
        from: 'users',
        localField: 'serviceProviderId',
        foreignField: '_id',
        as: 'serviceProviderId'
      })
      .project({
        _id: true,
        'customerId.name': true,
        'serviceProviderId.name': true,
        'serviceId.serviceName': true,
        'category.name': true,
        createdAt: true,
        orderDate: true,
        startsAt: true,
        endsAt: true,
        status: true,
        address: true,
        price: true,
        location: true
      })
      .sort(sortBy(req.query.sort));

    if (orders.length === 0)
      return res.status(200).json({
        message: 'Couldn\'t Found Any Orders'
      });

    return res.status(200).json({
      count: orders.length,
      orders: orders
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


function sortBy(sortFactor) {
  switch (sortFactor) {
    // case 'top-profit': 
    //   return {};
    case 'recently':
    default:
      return { createdAt: -1 };
  }
}

exports.createOrder = async (req, res) => {
  const { error } = validateCreateOrder(req.body);
  if (error)
    return res.status(400).json({ errorMessage: error.details[0].message });

  try {
    const token = jwt.verify(req.header('x-auth-token'), config.get('jwtPrivateKey'));

    if (!mongoose.isValidObjectId(token._id)) {
      return res.status(401).json({
        message: "Access Denied"
      });
    }

    if (token.role !== 'serviceProvider') {
      return res.status(401).json({
        message: 'Access Denied, Only Service Providers Can Access'
      });
    }

    req.body = _.pick(req.body, [
      "orderDate",
      "startsAt",
      "endsAt",
      "serviceName",
      "price",
      "address",
      "notes"
    ]);

    req.body.serviceProviderId = token._id;



    if ((new Date(req.body.startsAt) <= Date.now()) || (new Date(req.body.endsAt) <= Date.now))
      return res.status(400).json({
        message: 'you can\'t set your order date to a past date'
      });

    if (req.body.startsAt > req.body.endsAt)
      return res.status(400).json({
        message: 'The Time To Start The Order Is Earlier Than The Time To End It'
      });


    const service = await Service.findOne({
      serviceProviderId: req.body.serviceProviderId,
    });

    if (!service)
      return res.status(400).json({
        message: 'Couldn\'t Find This Service Provider '
      });

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
        message: "You Have Order At This Time",
      });

    req.body.serviceId = service._id;


    const order = new Order(req.body);

    console.log(order)


    res.status(201).json({
      orderInfo: _.pick(order, [
        "serviceProviderId",
        "serviceId",
        "serviceName",
        "orderDate",
        "startsAt",
        "endsAt",
        "price",
        "address",
        "status",
        "notes"
      ]),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


exports.confirmOrder = async (req, res, next) => {
  try {
    const token = jwt.verify(req.header('x-auth-token'), config.get('jwtPrivateKey'));

    req.body = _.pick(req.body, [
      "serviceProviderId",
      "serviceId",
      "serviceName",
      "orderDate",
      "startsAt",
      "endsAt",
      "price",
      "address",
      "status",
      "notes"
    ]);

    req.body.customerId = token._id;

    const service = await Service.findById(req.body.serviceId)

    const order = await Order.create(req.body);

    console.log(order)

    service.ordersList.push(order._id);

    await service.save();

    res.status(201).json({
      orderInfo: order
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
};
