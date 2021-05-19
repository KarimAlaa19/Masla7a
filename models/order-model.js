const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');


const orderSchema = new mongoose.Schema({
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    serviceProviderID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        required: true
    },
    orderDate: {
        type: Date,
        required: true
    },
    startsAt: {
        type: Date,
        required: true
    },
    endsAt: {
        type: Date,
        required: true
    },
    // paymentMethod:{

    // },
    serviceName: {
        type: String,
        minlength: true,
        trim: true,
        required: true
    },
    // notes: {
    //     type: String,
    //     maxlength: 2048
    // },
    price: {
        type: Number,
        min: 5,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'canceled'],
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


orderSchema.pre('save', async function (next) {
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
    next();
});

module.exports = mongoose.model('Order', orderSchema);