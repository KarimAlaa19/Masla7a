const mongoose = require('mongoose');
const Fuse = require('fuse.js');
const User = require('../../models/user-model');
const Order = require('../../models/order-model');
const Service = require('../../models/service-model');
const { cleanObj } = require('../../utils/filterHelpers');
const { split } = require('lodash');


const options = {
    minMatchCharLength: 1,
    threshold: 0.3,
    keys: [
        'name',
        'userName'
    ]
};

//           Users Controllers

exports.getNewUswes = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'Access Denied, Only Admins Can Access This'
        });

    try {

        let queryData = {};

        if (req.query.date_from && req.query.date_to) {
            if (new Date(req.query.date_from) > new Date(req.query.date_to))
                return res.status(400).json({
                    message: 'The Start Date is Greater Than The End Date.'
                })
        }

        const dateInterval = {
            $gte: !req.query.date_from ?
                undefined : new Date(req.query.date_from),
            $lte: !req.query.date_to ?
                undefined : new Date(req.query.date_to)
        };

        cleanObj(dateInterval);


        if (Object.keys(dateInterval).length > 0) {
            queryData = {
                'dateOfCreate': dateInterval
            }
        }

        const totalUsers = await User.find();

        if (totalUsers.length === 0)
            return res.status(200).json({
                message: 'No Users Added Yet.'
            });

        const newUsers = await User
            .aggregate([
                {
                    $set: {
                        dateOfCreate: {
                            $convert: {
                                input: '$_id',
                                to: 'date'
                            }
                        }
                    }
                },
                {
                    $match: queryData
                },
                {
                    $project: {
                        _id: true,
                        name: true,
                        profilePic: true,
                        dateOfCreate: true
                    }
                },
                {
                    $sort: {
                        dateOfCreate: -1
                    }
                }
            ]);


        newUsers.forEach(user => {
            let hours = Math.abs(Date.now() - user.dateOfCreate) / 36e5;
            user.memberForHours = parseInt(hours);
            delete user.dateOfCreate;
        });


        res.status(200).json({
            numberOfNewUsers: newUsers.length,
            percentageOfGrowing:
                Number(((newUsers.length / totalUsers.length) * 100).toFixed(1)),
            users: newUsers
        });


    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

exports.getAllUsersRole = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'Access Denied, Only Admins Can Access This'
        });

    try {

        let queryData = {
            role: { $in: ['customer', 'serviceProvider'] }
        };

        let countOfRoleUsers = 0;

        if (req.query.date_from && req.query.date_to) {
            if (new Date(req.query.date_from) > new Date(req.query.date_to))
                return res.status(400).json({
                    message: 'The Start Date is Greater Than The End Date.'
                })
        }

        const dateInterval = {
            $gte: !req.query.date_from ?
                undefined : new Date(req.query.date_from),
            $lte: !req.query.date_to ?
                undefined : new Date(req.query.date_to)
        };

        cleanObj(dateInterval);


        if (Object.keys(dateInterval).length > 0) {
            queryData.dateOfCreate = dateInterval;
        }

        const users = await User
            .aggregate([
                {
                    $set: {
                        dateOfCreate: {
                            $convert: {
                                input: '$_id',
                                to: 'date'
                            }
                        }
                    }
                },
                {
                    $match: queryData
                },
                {
                    $group: {
                        _id: {
                            role: '$role'
                        },
                        numberOfUsers: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: false,
                        role: '$_id.role',
                        numberOfUsers: true
                    }
                }
            ]);


        if (users.length === 0)
            return res.status(200).json({
                message: 'No Users Added Yet'
            });

        users.forEach(role => {
            countOfRoleUsers += role.numberOfUsers
        });

        res.status(200).json({
            totalNumberOfUsers: countOfRoleUsers,
            users: users
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


//          Customers Controllers

exports.getAllCustomers = async (req, res) => {
    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'Access Denied, Only Admins Can Access This'
        });

    try {

        let users = await User
            .find({
                role: 'customer'
            })
            .select({
                name: true,
                email: true,
                profilePic: true,
                phone_number: true,
                city: '$location.city',
            })
            .sort();

        if (req.query.search) {
            const usersList = [];
            const fuse = new Fuse(users, options);

            fuse.search(req.query.search).forEach(user => {
                usersList.push(user.item);
            });

            users = usersList;
        }

        if (users.length === 0)
            return res.status(200).json({
                message: 'No Users With This Specifications'
            });




        res.status(200).json({
            usersCount: users.length,
            users: users
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


exports.getActiveCustomers = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'Access Denied, Only Admins Can Access This'
        });

    try {

        let queryData = {
            status: { $in: ['completed', 'pending'] }
        };

        if (req.query.date_from && req.query.date_to) {
            if (new Date(req.query.date_from) > new Date(req.query.date_to))
                return res.status(400).json({
                    message: 'The Start Date is Greater Than The End Date.'
                })
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
        }

        const totalCustomers = await User
            .find({ role: 'customer' });


        if (totalCustomers === 0)
            return res.status(200).json({
                message: 'No Customers Added Yet.'
            });


        const activeCustomers = await Order
            .aggregate([
                {
                    $match: queryData
                },
                {
                    $group: {
                        _id: {
                            customer: '$customerId'
                        },
                        numberOfOrders: {
                            $sum: 1
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id.customer',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                {
                    $project: {
                        _id: { $first: '$customer._id' },
                        name: { $first: '$customer.name' },
                        profilePic: { $first: '$customer.profilePic' },
                        numberOfOrders: true
                    }
                },
                {
                    $sort: {
                        numberOfOrders: -1
                    }
                }
            ]);

        res.status(200).json({
            numberOfActiveCustomers: activeCustomers.length,
            percentageOfActiveCustomers:
                Number(((activeCustomers.length / totalCustomers.length) * 100).toFixed(1)),
            activeCustomers: activeCustomers
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};



//          Service Providers Controllers
exports.getAllServiceProviders = async (req, res) => {
    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'Access Denied, Only Admins Can Access This'
        });

    try {

        let serviceProviders = await Service
            .aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'serviceProviderId',
                        foreignField: '_id',
                        as: 'serviceProvider'
                    }
                },
                {
                    $set: {
                        averageRating: {
                            $ifNull: ['$averageRating', 1],
                        },
                        numberOfRatings: {
                            $ifNull: ['$numberOfRatings', 0],
                        }
                    }
                },
                {
                    $project: {
                        _id: { $first: '$serviceProvider._id' },
                        name: { $first: '$serviceProvider.name' },
                        userName: { $first: '$serviceProvider.userName' },
                        email: { $first: '$serviceProvider.email' },
                        city: { $first: '$serviceProvider.location.city' },
                        phone: { $first: '$serviceProvider.phone' },
                        averageRating: true,
                        numberOfRatings: true
                    }
                },
                {
                    $sort: sortBy(req.query.sort)
                }
            ]);

        if (req.query.search) {
            const spList = [];

            const fuse = new Fuse(serviceProviders, options);
            fuse.search(req.query.search).forEach(serviceProvider => {
                spList.push(serviceProvider.item);
            })
            serviceProviders = spList;
        }


        if (serviceProviders.length === 0)
            return res.status(200).json({
                message: 'No Service Providers Added Yet'
            });

        res.status(200).json({
            serviceProvidersCount: serviceProviders.length,
            serviceProviders: serviceProviders
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


exports.getTopServiceProviders = async (req, res, next) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'Access Denied, Only Admins Can Access This'
        });

    try {

        let queryData = {
            status: { $in: ['completed', 'pending'] }
        };

        if (req.query.date_from && req.query.date_to) {
            if (new Date(req.query.date_from) > new Date(req.query.date_to))
                return res.status(400).json({
                    message: 'The Start Date is Greater Than The End Date.'
                })
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
        }



        const serviceProviders = await Order
            .aggregate([
                {
                    $match: queryData
                },
                {
                    $group: {
                        _id: '$serviceProviderId',
                        numberOfOrders: {
                            $sum: 1
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'serviceProvider'
                    }
                },
                {
                    $lookup: {
                        from: 'services',
                        localField: 'serviceProvider.serviceId',
                        foreignField: '_id',
                        as: 'service'
                    }
                },
                {
                    $project: {
                        _id: { $first: '$serviceProvider._id' },
                        name: { $first: '$serviceProvider.name' },
                        profilePic: { $first: '$serviceProvider.profilePic' },

                        serviceName: { $first: '$service.serviceName' },
                        numberOfRatings: { $first: '$service.numberOfRatings' },
                        averageRating: { $first: '$service.averageRating' },

                        numberOfOrders: true
                    }
                },
                {
                    $sort: {
                        numberOfOrders: -1,
                        numberOfRatings: -1,
                        averageRating: -1
                    }
                }
            ]);


        if (serviceProviders.length < 7) {
            // const spCheck = [];
            // serviceProviders.forEach(sp => {
            //     spCheck.push(mongoose.Types.ObjectId(sp._id));
            // });

            let sp = await Service
                .aggregate([
                    // {
                    //     $match: {
                    //         serviceProviderId: {
                    //             $nin: spCheck
                    //         }
                    //     }
                    // },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'serviceProviderId',
                            foreignField: '_id',
                            as: 'serviceProvider'
                        }
                    },
                    {
                        $project: {
                            _id: '$serviceProvider._id',
                            name: '$serviceProvider.name',
                            profilePic: '$serviceProvider.profilePic',

                            serviceName: true,
                            averageRating: true,
                            numberOfRatings: true,
                            numberOfOrders: { $size: { $ifNull: ['$ordersList', []] } },

                        }
                    },
                    {
                        $sort: {
                            numberOfOrders: -1,
                            numberOfRatings: -1,
                            averageRating: -1
                        }
                    }
                ]);

            if (sp.length === 0)
                return res.status(200).jsin({
                    message: 'No Service Providers Added Yet.'
                });



            // sp = [...serviceProviders, ...sp];


            return res.status(200).json({
                serviceProvidersCount: sp.length,
                topServiceProviders: sp
            });
        }


        return res.status(200).json({
            serviceProvidersCount: serviceProviders.length,
            topServiceProviders: serviceProviders
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};



function sortBy(sortFactor) {
    switch (sortFactor) {
        case 'name_asc':
            return { name: 1 };
        case 'name_desc':
            return { name: -1 };
        case 'rating_asc':
            return {
                averageRating: 1,
                numberOfRatings: 1
            };
        case 'rating_desc':
            return {
                numberOfRatings: -1,
                averageRating: -1,
            };
        default:
            return { _id: 1 };
    }
}