
const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const pagination = require('mongoose-paginate-v2')


const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceProviderID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ServiceProvider'
    },
    description: {
        type: String,
        minlength: 20,
        maxlength: 1024,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    serviceName: {
        type: String,
        minlength: 3,
        trim: true,
        required: true
    },
    servicePrice: {
        type: Number,
        min: 5,
        required: true
    }
});



module.exports = mongoose.model('Service', serviceSchema);