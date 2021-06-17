const Category = require('../models/category-model');
const categoryValidator = require('../validators/category-validator');


exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category
            .find()
            .select('name');

        if (!categories) return res.status(200).json({ message: 'No categories added yet' });

        return res.status(200).json({ categories: categories });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};


exports.addCategory = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'you are not allowed to make changes here'
        });

    const result = categoryValidator.validateCategory(req.body).error;
    if (result) return res.status(400).json({ message: result.details[0].message });

    try {
        const category = await Category.create(req.body);
        res.status(201).json({
            category: category
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.editCategory = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'you are not allowed to make changes here'
        });

    const result = categoryValidator.validateCategory(req.body).error;
    if (result) return res.status(400).json({ message: result.details[0].message });

    try {
        const category = await Category.findByIdAndUpdate(req.params.categoryId,
            { $set: { name: req.body.name } },
            { new: true });

        if (!category)
            return res.status(400).json({
                message: 'The Category You Chose Doesn\'t Exist'
            });

        res.status(201).json({
            category: category
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.deleteCategory = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'you are not allowed to make changes here'
        });

    try {
        const category = await Category.findByIdAndDelete(req.params.categoryId);

        if (!category)
            return res.status(400).json({
                message: 'The Category You Chose Doesn\'t Exist'
            });
        res.status(201).json({
            message: 'Category Deleted Successfully'
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getAllServicesInCategory = async (req, res) => {

    if (req.user.role !== 'admin')
        return res.status(403).json({
            message: 'you are not allowed to make changes here'
        });

    try {
        const category = await Category
            .findById(req.params.categoryId)
            .populate('servicesList', 'serviceName');


        if (!category)
            return res.status(200).json({
                message: 'The Category You Are Trying To Access Doesn\'t Exist'
            });


        if (category.servicesList.length === 0)
            return res.status(200).json({
                message: `The ${category.name} Doesn't Contain Any Service`
            });

        res.status(200).json({
            servicesCount: category.servicesList.length,
            category: category
        });
    } catch (err) {
        res.status(500).json({
            errorMessage: err.message
        });
    }
};