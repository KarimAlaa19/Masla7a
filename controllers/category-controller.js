// const Category = require('../models/category-model');
// const ServiceProvider = require('../models/service-provider-model');
// const jwt = require('jsonwebtoken');
// const config = require('config');
// const categoryValidator = require('../validators/category-validator');


// exports.getAllCategories = async (req, res) => {
//     try {
//         const categories = await Category.find();

//         if (!categories) return res.status(200).json({ message: 'No categories added yet' });

//         return res.status(200).json({ categories: categories });
//     } catch (err) {
//         res.send(err.message);
//     }
// };


// exports.addCategory = async (req, res) => {

//     if (!req.user.isAdmin)
//         return res.status(403).json({
//             message: 'you are not allowed to make changes here'
//         });

//     const result = categoryValidator.validateCategory(req.body).error;
//     if (result) return res.status(400).json({ message: result.details[0].message });

//     try {
//         const category = await Category.create(req.body);
//         res.status(201).json({
//             category: category
//         })
//     } catch (err) {
//         res.json({ message: err.message });
//     }
// };


// exports.editCategory = async (req, res) => {

//     if (!req.user.isAdmin)
//         return res.status(403).json({
//             message: 'you are not allowed to make changes here'
//         });

//     const result = categoryValidator.validateCategory(req.body).error;
//     if (result) return res.status(400).json({ message: result.details[0].message });

//     try {
//         const category = await Category.findByIdAndUpdate(req.params.categoryId,
//             { $set: { name: req.body.name } },
//             { new: true });
//         res.status(201).json({
//             category: category
//         })
//     } catch (err) {
//         res.json({ message: err.message });
//     }
// };


// exports.deleteCategory = async (req, res) => {

//     if (!req.user.isAdmin)
//         return res.status(403).json({
//             message: 'you are not allowed to make changes here'
//         });

//     try {
//         const category = await Category.findByIdAndDelete(req.params.categoryId);
//         res.status(201).json({
//             category: category
//         })
//     } catch (err) {
//         res.json({ message: err.message });
//     }
// };


// exports.filterSearch = async (req, res) => {

//     try {
//         const dataFilter = {
//             'location.city': req.query.city
//         };
//         console.log(dataFilter)
//         cleanObj(dataFilter);
//         console.log(dataFilter)

//         const minPrice = (await ServiceProvider.findOne({
//             category: req.params.categoryID,
//             ...dataFilter
//         })
//             .select('servicePrice -_id')
//             .sort({ servicePrice: 1 })).servicePrice,
//             maxPrice = (await ServiceProvider.findOne({
//                 category: req.params.categoryID,
//                 ...dataFilter
//             })
//                 .select('servicePrice -_id')
//                 .sort({ servicePrice: -1 })).servicePrice;


//         console.log(minPrice)

//         const serviceProviders = await ServiceProvider.find({
//             category: req.params.categoryID,
//             servicePrice: {
//                 $gte: req.query.price_from || minPrice,
//                 $lte: req.query.price_to || maxPrice
//             },
//             ...dataFilter
//         })
//             .populate('userID', 'name phone_number profilePic -_id')
//             .populate('category')
//             .select('userID category')
//             .sort(sortBy(req.query.sort_by));

//         if (serviceProviders.length === 0) return res.send('could not find any service provider');

//         res.json({
//             count: serviceProviders.length,
//             sp: serviceProviders
//         });

//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }

// };


// const cleanObj = (obj) => {
//     Object.keys(obj).forEach(key => obj[key] === undefined ?
//         delete obj[key] : true);
// };


// function sortBy(sortFactor) {
//     switch (sortFactor) {
//         case 'price_asc':
//             return { price: 1 };
//         case 'price_desc':
//             return { price: -1 };
//         // case 'most_rated':
//         //     return {};
//         // case 'popularity':
//         // default:
//         //     return {};
//     }
// }