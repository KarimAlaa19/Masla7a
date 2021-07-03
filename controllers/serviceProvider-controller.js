const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const Fuse = require('fuse.js');
const geolib = require('geolib');
const Service = require('../models/service-model');
const Category = require('../models/category-model');
const User = require('..//models/user-model');
const { cleanObj } = require('../utils/filterHelpers');

const options = {
    minMatchCharLength: 1,
    threshold: 0.3,
    keys: [
        'serviceName',
        'serviceProviderId.name',
        'serviceProviderId.userName'
    ]
};



exports.topServiceProviders = async (req, res, next) => {
    try {

        const token = req.header('x-auth-token');

        const serviceProviders = await Service
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
                    $project: {
                        _id: false,
                        serviceName: true,
                        servicePrice: true,
                        averageRating: true,
                        numberOfRatings: true,
                        ordersNumber: { $size: { $ifNull: ['$ordersList', []] } },
                        serviceProvider: {
                            _id: true,
                            name: true,
                            gender: true,
                            profilePic: true,
                            availability: true
                        }
                    }
                },
                {
                    $set: {
                        favourite: false
                    }
                },
                {
                    $sort: {
                        ordersNumber: -1,
                        numberOfRatings: -1,
                        averageRating: -1
                    }
                }
            ]);

        if (serviceProviders.length === 0)
            return res.status(200).json({
                message: 'No Service Providers Added Yet'
            });


        serviceProviders.map(serviceProvider => {
            if (!serviceProvider.averageRating) {
                serviceProvider.averageRating = 1
            }
        });

        if (token) {
            const decodedToken = jwt.verify(token, config.get('jwtPrivateKey'));

            let user = await User.findById(decodedToken._id);

            if (!user)
                return res.status(400).json({
                    message: 'The User Sent In The Token not Found'
                });

            serviceProviders.forEach((service => {
                if (user.favouritesList.includes(service._id)) {
                    service.favourite = true;
                } else {
                    service.favourite = false;
                }
            }));
        }
        return res.status(200).json({
            //serviceProvidersCount: serviceProviders.length,
            serviceProviders
        });

    } catch (err) {
        if (err.message.includes('Unexpected token'))
            return res.status(400).json({
                message: 'Invalid Token'
            });

        res.status(500).json({
            message: err.message
        });
    }
};


exports.filterServices = async (req, res, next) => {

    const token = req.header('x-auth-token');

    if ((req.params.categoryId) && (!mongoose.isValidObjectId(req.params.categoryId)))
        return res.status(400).json({
            message: 'The Category You Chose Doesn\'t Exist'
        });

    try {

        let locationData = {};

        let decodedToken;

        if (token) {
            decodedToken = jwt.verify(token, config.get('jwtPrivateKey'));
            var userToken = await User.findById(decodedToken._id);
            if (!userToken)
                return res.status(400).json({
                    message: 'The User in The Token not found'
                })
        }

        if (req.params.categoryId !== undefined) {
            const category = await Category.findById(req.params.categoryId);

            if (!category)
                return res.status(404).json({
                    message: 'Page Not Found'
                });
        }


        const queryData = {
            categoryId: !req.params.categoryId ?
                undefined : mongoose.Types.ObjectId(req.params.categoryId),

            averageRating: ((!req.query.rating) || (req.query.rating <= 0.4)) ?
                undefined : { $gte: Number(req.query.rating) }
        };


        const servicePrice = {
            $gte: req.query.price_from === undefined ?
                undefined : Number(req.query.price_from),
            $lte: req.query.price_to === undefined ?
                undefined : Number(req.query.price_to)
        };

        {
            //locationData = {
            //     'serviceProviderId.location.city': req.query.city === undefined ?
            //         undefined : new RegExp(`.*${req.query.city}.*`, 'i')
            // };


            if (token &&
                decodedToken.gotAddress === true) {
                var user = await User.findById(decodedToken._id);
                locationData = {
                    //     'serviceProviderId.location.city': req.query.city === undefined ?
                    //         user.location.city : new RegExp(`.*${req.query.city}.*`, 'i'),

                    'serviceProviderId.location': (req.query.distance === undefined ||
                        req.query.distance === 0) ?
                        undefined : {
                            $geoWithin: {
                                $centerSphere: [
                                    user.location.coordinates,
                                    (req.query.distance / 6371.1)
                                ]
                            }
                        }
                }
                var userCoordinates = user.location.coordinates;
            }

            cleanObj(locationData)
        }

        cleanObj(queryData);
        cleanObj(servicePrice);


        if (Object.keys(servicePrice).length > 0)
            queryData.servicePrice = servicePrice;


        let services = await Service
            .aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'serviceProviderId',
                        foreignField: '_id',
                        as: 'serviceProviderId'
                    }
                },
                {
                    $match: { ...queryData, ...locationData }
                },
                {
                    $set: {
                        favourite: false
                    }
                },
                {
                    $project: {
                        _id: true,
                        serviceName: true,
                        servicePrice: true,
                        serviceProvider: {
                            _id: { $first: '$serviceProviderId._id' },
                            name: { $first: '$serviceProviderId.name' },
                            userName: { $first: '$serviceProviderId.userName' },
                            profilePic: { $first: '$serviceProviderId.profilePic' },
                            availability: { $first: '$serviceProviderId.availability' },
                            'location.coordinates': {
                                $first: '$serviceProviderId.location.coordinates'
                            }
                        },
                        averageRating: true,
                        numberOfRatings: true,
                        numberOfOrders: { $size: { $ifNull: ['$ordersList', []] } }
                    }
                },
                {
                    $sort: sortBy(req.query.sort)
                }
            ]);


        if (services.length === 0)
            return res.status(200).json({
                message: 'Could Not Find Any Service'
            });


        if (token) {
            if (!userToken)
                return res.status(400).json({
                    message: 'The User Sent In The Token not Found'
                });

            services.forEach((service => {
                if (userToken.favouritesList.includes(service._id)) {
                    service.favourite = true;
                }
            }));
        }


        if (req.query.search) {
            let servicesList = [];
            const fuse = new Fuse(services, options);

            fuse.search(req.query.search).forEach(service => {
                servicesList.push(service.item);
            });
            services = servicesList;
        }

        if (token &&
            decodedToken.gotAddress === true) {
            services.forEach(element => {
                element.distance = (geolib.getPreciseDistance(
                    {
                        latitude: userCoordinates[1],
                        longitude: userCoordinates[0]
                    },
                    {
                        latitude: element.serviceProvider.location.coordinates[1],
                        longitude: element.serviceProvider.location.coordinates[0]
                    },
                    10
                ) / 1000);
                delete element.serviceProvider.location;
            });
        } else {
            services.forEach(element => {
                element.distance = 0;
                delete element.serviceProvider.location;
            });
        }

        services.map(service => {
            if (!service.averageRating) {
                service.averageRating = 1
            }
        });


        res.json({
            count: services.length,
            services: services
        });

    } catch (err) {
        if (err.message.includes('Unexpected token'))
            return res.status(400).json({
                message: 'Invalid Token'
            });
        res.status(500).json({ message: err.message });
    }

};


function sortBy(sortFactor) {
    switch (sortFactor) {
        case 'price_asc':
            return { servicePrice: 1 };
        case 'price_desc':
            return { servicePrice: -1 };
        case 'most_rated':
            return {
                averageRating: -1,
                numberOfRatings: -1
            };
        case 'popularity':
        default:
            return {
                numberOfOrders: -1,
                numberOfRatings: -1,
            };
    }
}