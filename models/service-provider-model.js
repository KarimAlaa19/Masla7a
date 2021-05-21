
const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');


const service_provider_schema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    gallery: [{
        type: String
    }],
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
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddres: String,
        city: String,
        zipcode: String,
        streetName: String,
        streetNumber: String,
        countryCode: String
    }
});


service_provider_schema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddres: loc[0].formattedAddress,
        city: loc[0].city,
        zipcode: loc[0].zipcode,
        streetName: loc[0].streetName,
        streetNumber: loc[0].streetNumber,
        countryCode: loc[0].countryCode
    };
    next();
});


module.exports = mongoose.model('ServiceProvider', service_provider_schema);