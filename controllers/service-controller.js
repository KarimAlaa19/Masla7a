const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const Service = require('../models/service-model');
const Category = require('../models/category-model');
const User = require('../models/user-model');
const Fuse = require('fuse.js');

const options = {
    minMatchCharLength: 1,
    threshold: 0.2,
    keys: [
        'serviceName',
        'serviceProviderId.name',
        'serviceProviderId.userName'
    ]
}



exports.filterServices = async (req, res, next) => {

    const token = req.header('x-auth-token');

    if ((!mongoose.isValidObjectId(req.params.categoryId)) || (!req.params.categoryId))
        return res.status(400).json({
            message: 'The Category You Chose Doesn\'t Exist'
        });

    try {

        let decodedToken;

        if (token) {
            decodedToken = jwt.verify(token, config.get('jwtPrivateKey'));
        }

        const category = await Category.findById(req.params.categoryId);

        if (!category)
            return res.status(404).json({
                message: 'Page Not Found'
            });


        const queryData = {
            categoryId: mongoose.Types.ObjectId(req.params.categoryId)
        };

        const servicePrice = {
            $gte: req.query.price_from === undefined ?
                undefined : Number(req.query.price_from),
            $lte: req.query.price_to === undefined ?
                undefined : Number(req.query.price_to)
        };

        let locationData = {
            'serviceProviderId.location.city': req.query.city === undefined ?
                undefined : new RegExp(`.*${req.query.city}.*`, 'i')
        };


        if (token &&
            decodedToken.gotAddress === true) {
            const user = await User.findById(decodedToken._id);
            locationData = {
                'serviceProviderId.location.city': req.query.city === undefined ?
                    user.location.city : new RegExp(`.*${req.query.city}.*`, 'i'),

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
        }


        cleanObj(queryData);
        cleanObj(servicePrice);
        cleanObj(locationData)


        if (Object.keys(servicePrice).length > 0)
            queryData.servicePrice = servicePrice;



        let services = await Service
            .aggregate()
            .lookup({
                from: 'users',
                localField: 'serviceProviderId',
                foreignField: '_id',
                as: 'serviceProviderId'
            })
            .match({ ...queryData, ...locationData })
            .project({
                _id: true,
                serviceName: true,
                servicePrice: true,
                serviceProviderId: {
                    _id: true,
                    name: true,
                    userName: true,
                    'location.streetName': true
                },
                ordersNumber: { $size: '$ordersList' }
            })
            .sort(sortBy(req.query.sort));


        if (req.query.search) {
            const fuse = new Fuse(services, options);

            services = fuse.search(req.query.search);
        }



        if (services.length === 0)
            return res.status(200).json({
                message: 'Could Not Find Any Service'
            });


        res.json({
            count: services.length,
            services: services
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

};


const cleanObj = (obj) => {
    Object.keys(obj).forEach(key => obj[key] === undefined ?
        delete obj[key] : true);
};


function sortBy(sortFactor) {
    switch (sortFactor) {
        case 'price_asc':
            return { servicePrice: 1 };
        case 'price_desc':
            return { servicePrice: -1 };
        // case 'most_rated':
        //     return {};
        case 'popularity':
        default:
            return { ordersNumber: -1 };
    }
}