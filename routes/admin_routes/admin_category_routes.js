
const express = require('express');
const { getAllCategories, getAllServicesInCategory, addCategory, editCategory, deleteCategory } =
    require('../../controllers/category-controller');
const { extractingToken } = require('../../controllers/user-auth');

const router = express.Router();

router.get('/', getAllCategories);

router.get('/:categoryId', getAllServicesInCategory);

router.post('/add-category', extractingToken, addCategory);

router.put('/edit-category/:categoryId', extractingToken, editCategory);

router.delete('/delete-category/:categoryId', extractingToken, deleteCategory);

module.exports = router;