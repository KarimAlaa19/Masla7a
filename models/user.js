
const mongoose = require('mongoose');
const config = require('config')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        minlength: 8,
        maxlength: 64
    },
    isAdmain:{
        type: Boolean,
        required: true,
        default: false
    },
    age: {
        type: Number,
        required: true,
        min: 16,
        max: 100
    },
    nationalID: {
        type: String,
        minlength: 14,
        maxlength: 28
    },
    profilePic: {
        type: String,
        required: false
    },
    phone_number: {
        type: String,
        required: true
    }, 
    gender:{
        type: String,
        required: true
    },
    username:{
        type:String,
        required:true
    },
    isServiceProvider :{
        type: Boolean,
        required: true,
        default: false
    }
});
userSchema.methods.generateAuthToken = function() { 
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin, email:this.email }, config.get('jwtPrivateKey'));
    return token;
  }

const User = mongoose.model('User', userSchema);
exports.User = User;
//module.exports = User;