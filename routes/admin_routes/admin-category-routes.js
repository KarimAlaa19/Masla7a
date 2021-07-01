
const express = require('express');
const { getAllCategories, getAllServicesInCategory, addCategory, editCategory, deleteCategory } =
    require('../../controllers/category-controller');
const multerConfig = require("../../images/images-controller/multer");

const router = express.Router();

router.get('/', getAllCategories);

router.get('/:categoryId', getAllServicesInCategory);

router.post('/add-category', multerConfig,addCategory);

router.post('/edit-category/:categoryId',multerConfig, editCategory);

router.get('/delete-category/:categoryId', deleteCategory);

module.exports = router;