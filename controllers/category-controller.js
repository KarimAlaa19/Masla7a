const Category = require("../models/category-model");


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category
      .find()
      .select({
        name: 1,
        coverPhoto: 1,
        icon: 1
      });

    if (!categories)
      return res.status(200).json({ message: "No categories added yet" });

    return res.status(200).json({ categories: categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};