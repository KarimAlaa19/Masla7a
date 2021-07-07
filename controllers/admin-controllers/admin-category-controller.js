const mongoose = require('mongoose');
const _ = require("lodash");
const fs = require("fs");
const cloud = require("../../images/images-controller/cloudinary");
const categoryValidator = require("../../validators/category-validator");
const Category = require("../../models/category-model");
// const Service = require('../../models/service-model');
const Order = require('../../models/order-model');
const { cleanObj } = require('../../utils/filterHelpers')



exports.getAllCategories = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'You are not authorized to access this end-point, only admins'
        });

    try {

        let queryData = {};

        if (req.query.date_from && req.query.date_to) {
            if (new Date(req.query.date_from) >= new Date(req.query.date_to))
                return res.status(400).json({
                    message: 'The Start Date is Greater Than The End Date.'
                })
        }

        const orderDate = {
            $gte: !req.query.date_from ?
                undefined : new Date(req.query.date_from),
            $lte: !req.query.date_to ?
                undefined : new Date(req.query.date_to)
        };

        cleanObj(orderDate);


        if (Object.keys(orderDate).length > 0) {
            queryData = {
                'orderDate': orderDate
            }
        }


        const categories = await Order
            .aggregate([
                {
                    $match: queryData
                },
                {
                    $lookup: {
                        from: 'services',
                        localField: 'serviceId',
                        foreignField: '_id',
                        as: 'service'
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'service.categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $group: {
                        _id: {
                            _id: '$category._id',
                            name: '$category.name',
                            coverPhoto: '$category.coverPhoto',
                            icon: '$category.icon'
                        },
                        numberOfOrders: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: { $first: '$_id._id' },
                        name: { $first: '$_id.name' },
                        coverPhoto: { $first: '$_id.coverPhoto' },
                        icon: { $first: '$_id.icon' },
                        numberOfOrders: true
                    }
                },
                {
                    $sort: {
                        numberOfOrders: -1
                    }
                }
            ]);


        if (categories.length === 0)
            return res.status(200).json({
                message: 'No Categories Have Orders At This Time'
            });


        const idArr = [];

        categories.forEach(category => {
            idArr.push(category._id);
        });

        const categoryList = await Category
            .find({
                _id: { $nin: idArr }
            });

        if (categoryList.length > 0) {
            categoryList.forEach(category => {
                categories.push({
                    _id: category._id,
                    name: category.name,
                    coverPhoto: category.coverPhoto,
                    icon: category.icon,
                    numberOfOrders: 0
                });
            });
        }

        res.status(200).json({
            count: categories.length,
            categories: categories
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.addCategory = async (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({
            message: "you are not allowed to make changes here",
        });

    const result = categoryValidator.validateCreateCategory(req.body).error;
    if (result)
        return res.status(400).json({ message: result.details[0].message });

    try {
        const category = await Category.create(req.body);


        if (req.files) {
            for (var i = 0; i < req.files.length; i++) {
                if (req.files[i].fieldname === "icon") {
                    const result = await cloud.uploads(req.files[i].path);
                    category.icon = result.url;
                    fs.unlinkSync(req.files[i].path);
                } else if (req.files[i].fieldname === "coverPhoto") {
                    const result = await cloud.uploads(req.files[i].path);
                    category.coverPhoto = result.url;
                    fs.unlinkSync(req.files[i].path);
                }
            }
        }

        await category.save();

        res.status(201).json({
            category: category,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.editCategory = async (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({
            message: "you are not allowed to make changes here",
        });

    const result = categoryValidator.validateEditCategory(req.body).error;
    if (result)
        return res.status(400).json({ message: result.details[0].message });

    try {
        const category = await Category
            .findByIdAndUpdate(
                req.params.categoryId,
                { $set: req.body },
                { new: true }
            )
            .select({
                name: true,
                icon: true,
                coverPhoto: true
            });

        if (!category)
            return res.status(400).json({
                message: "The Category You Chose Doesn't Exist",
            });

        if (req.files) {
            for (var i = 0; i < req.files.length; i++) {
                if (req.files[i].fieldname === "icon") {
                    const result = await cloud.uploads(req.files[i].path);
                    category.icon = result.url;
                    fs.unlinkSync(req.files[i].path);
                } else if (req.files[i].fieldname === "coverPhoto") {
                    const result = await cloud.uploads(req.files[i].path);
                    category.coverPhoto = result.url;
                    fs.unlinkSync(req.files[i].path);
                }
            }
        }

        await category.save();

        res.status(201).json({
            category: category,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({
            message: "you are not allowed to make changes here",
        });

    try {
        const category = await Category.findByIdAndDelete(req.params.categoryId);

        if (!category)
            return res.status(400).json({
                message: "The Category You Chose Doesn't Exist",
            });
        res.status(201).json({
            message: "Category Deleted Successfully",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllServicesInCategory = async (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({
            message: "you are not allowed to make changes here",
        });

    try {
        const category = await Category
            .findById(req.params.categoryId)
            .populate(
                "servicesList",
                "serviceName"
            );

        if (!category)
            return res.status(200).json({
                message: "The Category You Are Trying To Access Doesn't Exist",
            });

        if (category.servicesList.length === 0)
            return res.status(200).json({
                message: `The ${category.name} Doesn't Contain Any Service`,
            });

        res.status(200).json({
            servicesCount: category.servicesList.length,
            category: category,
        });
    } catch (err) {
        res.status(500).json({
            errorMessage: err.message,
        });
    }
};

exports.getTopCategories = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'You are not authorized to access this end-point, only admins'
        });

    try {

        let queryData = {};

        if (req.query.date_from && req.query.date_to) {
            if (new Date(req.query.date_from) >= new Date(req.query.date_to))
                return res.status(400).json({
                    message: 'The Start Date is Greater Than The End Date.'
                })
        }

        const orderDate = {
            $gte: !req.query.date_from ?
                undefined : new Date(req.query.date_from),
            $lte: !req.query.date_to ?
                undefined : new Date(req.query.date_to)
        };

        cleanObj(orderDate);


        if (Object.keys(orderDate).length > 0) {
            queryData = {
                'orderDate': orderDate
            }
        }


        const categories = await Order
            .aggregate([
                {
                    $match: queryData
                },
                {
                    $lookup: {
                        from: 'services',
                        localField: 'serviceId',
                        foreignField: '_id',
                        as: 'service'
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'service.categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $group: {
                        _id: {
                            _id: '$category._id',
                            name: '$category.name',
                            coverPhoto: '$category.coverPhoto',
                            icon: '$category.icon'
                        },
                        numberOfOrders: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: { $first: '$_id._id' },
                        name: { $first: '$_id.name' },
                        coverPhoto: { $first: '$_id.coverPhoto' },
                        icon: { $first: '$_id.icon' },
                        numberOfOrders: true
                    }
                },
                {
                    $sort: {
                        numberOfOrders: -1
                    }
                }
            ]);


        if (categories.length === 0)
            return res.status(200).json({
                message: 'No Categories Have Orders At This Time'
            });


        const idArr = [];

        categories.forEach(category => {
            idArr.push(category._id);
        });

        const categoryList = await Category
            .find({
                _id: { $nin: idArr }
            });

        if (categoryList.length > 0) {
            categoryList.forEach(category => {
                categories.push({
                    _id: category._id,
                    name: category.name,
                    coverPhoto: category.coverPhoto,
                    icon: category.icon,
                    numberOfOrders: 0
                });
            });
        }

        res.status(200).json({
            count: categories.length,
            categories: categories
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
