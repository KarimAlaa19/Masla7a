
const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const geocoder = require('../utils/geocoder');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 55,
        trim: true,
        required: true
    },
    email: {
        type: String,
        minlength: 10,
        maxlength: 255,
        trim: true,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 64,
        required: true
    },
    age: {
        type: Number,
        min: 16,
        max: 100,
        required: true
    },
    gender: {
        type: String,
        trim: true,
        required: true
    },
    nationalID: {
        type: String,
        minlength: 14,
        trim: true,
        maxlength: 28
    },
    profilePic: {
        type: String,
        required: false
    },
    phone_number: {
        type: String,
        minlength: 11,
        required: true
    },
    address: {
        type: String,
        required: function () {
            return this.role === 'serviceProvider';
        },
        validate: {
            validator: function () {
                return (this.role === 'serviceProvider') ||
                    (this.role === 'basic');
            },
            message: 'Only Service Provider Can Assign This Field'
        }
    },
    // location: {
    //     type: {
    //         type: String,
    //         enum: ['Point']
    //     },
    //     coordinates: {
    //         type: [Number],
    //         index: '2dsphere'
    //     },
    //     formattedAddres: String,
    //     city: String,
    //     zipcode: String,
    //     streetName: String,
    //     streetNumber: String,
    //     countryCode: String
    // },
    role: {
        type: String,
        enum: ['customer',
            'serviceProvider',
            'admin'],
        default: 'customer',
        required: true
    },
    serviceId: {
        type: mongoose.Types.ObjectId,
        ref: 'Service'
    }
});


userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({
        _id: this._id,
        role : this.role,
        email: this.email,
        userName: this.userName
    }, config.get('jwtPrivateKey'));
    return token;
};


// userSchema.pre('save', async function (next) {
//     const loc = await geocoder.geocode(this.address);
//     this.location = {
//         type: 'Point',
//         coordinates: [loc[0].longitude, loc[0].latitude],
//         formattedAddres: loc[0].formattedAddress,
//         city: loc[0].city,
//         zipcode: loc[0].zipcode,
//         streetName: loc[0].streetName,
//         streetNumber: loc[0].streetNumber,
//         countryCode: loc[0].countryCode
//     };
//     this.address = undefined;
//     next();
// });



module.exports = mongoose.model('User', userSchema);;