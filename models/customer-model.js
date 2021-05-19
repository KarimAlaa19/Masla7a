
const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');


const Schema = mongoose.Schema;

const customerSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: false
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


customerSchema.pre('save', async function (next) {
    if (this.address) {
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
        this.address = undefined;
    }
    next();
});


module.exports = mongoose.model('Customer', customerSchema);;