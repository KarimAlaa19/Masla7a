
const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    address :{
        type:String
    }
});

const Customer = mongoose.model('Customer', customerSchema);
exports.Customer = Customer;