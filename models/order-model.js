const mongoose = require('mongoose');
const config = require('config')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema;
 
const orderSchema = Schema({
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
    createdAt:{

    },
    orderDate:{
    type:[Date]
    },
    paymentMethod:{

    },
    serviceName:{

    },
    notes:{

    },
    price:{

    },
    statues:{

    },
    address:{

    },
    
})