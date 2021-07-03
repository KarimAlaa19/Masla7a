const mongoose = require("mongoose");
const Order = require("../../models/order-model");
const Service = require("../../models/service-model");
const { cleanObj } = require('../../utils/filterHelpers');



exports.getRecentOrders = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'Access Denied, Only Admins Can Access This'
        });

    try {

        let queryData = {
            // status: { $in: ['completed', 'pending'] }
        };

        if (req.query.date_from && req.query.date_to) {
            if (new Date(req.query.date_from) > new Date(req.query.date_to))
                return res.status(400).json({
                    message: 'The Start Date is Greater Than The End Date.'
                });
        }

        const dateInterval = {
            $gte: !req.query.date_from ?
                undefined : new Date(req.query.date_from),
            $lte: !req.query.date_to ?
                undefined : new Date(req.query.date_to)
        };

        cleanObj(dateInterval);

        if (Object.keys(dateInterval).length > 0) {
            queryData.orderDate = dateInterval
        } else {
            queryData.orderDate = {
                $lte: new Date()
            }
        }


        const orders = await Order
            .aggregate([
                {
                    $match: queryData
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customerId'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'serviceProviderId',
                        foreignField: '_id',
                        as: 'serviceProviderId'
                    }
                },
                {
                    $project: {
                        _id: true,
                        startsAt: true,
                        price: true,
                        status: true,
                        customer: {
                            _id: { $first: '$customerId._id' },
                            name: { $first: '$customerId.name' }
                        },
                        serviceProvider: {
                            _id: { $first: '$serviceProviderId._id' },
                            name: { $first: '$serviceProviderId.name' }
                        }
                    }
                },
                {
                    $sort: {
                        startsAt: -1
                    }
                }
            ]);


        if (orders.length === 0)
            return res.status(200).json({
                message: 'Couldn\'t Found Any Orders Made At This Time.'
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


// function sortBy(sortFactor) {
//     switch (sortFactor) {
//         // case 'top-profit': 
//         //   return {};
//         case 'recently':
//         default:
//             return { createdAt: -1 };
//     }
// }