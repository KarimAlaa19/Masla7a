
const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const pagination = require('mongoose-paginate-v2')


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
    password: {
        type: String,
        minlength: 8,
        maxlength: 64,
        required: true
    },
    userName: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isServiceProvider: {
        type: Boolean,
        required: true,
        default: false
    },
    age: {
        type: Number,
        min: 16,
        max: 100,
        required: true
    },
    nationalID: {
        type: String,
        minlength: 14,
        trim: true,
        maxlength: 28
    },
    gender: {
        type: String,
        trim: true,
        required: true
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
    availability: {
        type: String,
        enum: ['online','offline','busy'],
        default: 'offline'
    }
});


userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({
        _id: this._id,
        isAdmin: this.isAdmin,
        email: this.email,
        isServiceProvider: this.isServiceProvider
    }, config.get('jwtPrivateKey'));
    return token;
}

userSchema.plugin(pagination);
module.exports = mongoose.model('User', userSchema);;