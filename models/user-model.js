const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const notificationService = require('../services/notification')
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
        }
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
        // formattedAddres: String,
        // zipcode: String,
        city: String,
        streetName: String,
        streetNumber: String,
        countryCode: String
    },
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
    },
    availability: {
        type: String,
        enum: ['online',
            'offline',
            'busy'],
        default: 'offline',
        required: true
    },
    favouritesList: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    pushTokens: [
        new mongoose.Schema(
          {
            deviceType: {
              type: String,
              enum: ["android", "ios", "web"],
              default: 'web',
              required: true,
            },
            deviceToken: {
              type: String,
              required: true,
            },
          },
          { _id: false }
        ),
      ],

});


userSchema.methods.user_send_notification = async function (message) {
    let changed = false;
    let len = this.pushTokens.length;
    while (len--) {
      const deviceToken = this.pushTokens[len].deviceToken;
      try {
        await notificationService.firebaseSendNotification(deviceToken, message);
      }catch (err) {
        this.pushTokens.splice(len, 1);
        changed = true;
      }
    }
    if (changed) await this.save();
  };


userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        role: this.role,
        gotAddress: (this.address !== undefined)
    }, config.get('jwtPrivateKey'));
    return token;
};


userSchema.pre('save', async function (next) {
    if (this.address) {
        const loc = await geocoder.geocode(this.address);
        this.location = {
            type: 'Point',
            coordinates: [loc[0].longitude, loc[0].latitude],
            // formattedAddres: loc[0].formattedAddress,
            city: loc[0].city,
            // zipcode: loc[0].zipcode,
            streetName: loc[0].streetName,
            streetNumber: loc[0].streetNumber,
            countryCode: loc[0].countryCode
        };
        this.address = loc[0].formattedAddress;
    }
    next();
});



module.exports = mongoose.model('User', userSchema);;