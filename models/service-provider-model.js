
const mongoose = require('mongoose');
const config = require('config')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema;

const service_provider_schema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    gallery:[{
        type:String
    }],
    description : {
        type: String,
        max: 500
    },
    category:{
        type: String,
        required: true
    },
    price:{
        type:Number,
        required:true
    }
});

const ServiceProvider = mongoose.model('ServiceProvider', service_provider_schema);
exports.ServiceProvider = ServiceProvider;