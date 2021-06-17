
const express = require('express');
const { getAllCategories, getAllServicesInCategory, addCategory, editCategory, deleteCategory } =
    require('../../controllers/category-controller');


const router = express.Router();

router.get('/', getAllCategories);

router.get('/:categoryId', getAllServicesInCategory);

router.post('/add-category', addCategory);

router.post('/edit-category/:categoryId', editCategory);

router.get('/delete-category/:categoryId', deleteCategory);

module.exports = router;