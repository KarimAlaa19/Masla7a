const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 55,
        trim: true,
        required: true,
        unique: true
    }
});



module.exports = mongoose.model('Category', categorySchema);