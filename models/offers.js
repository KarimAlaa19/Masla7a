const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const offerSchema = new Schema(
  {
    service: {
      type: mongoose.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceProvider: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    daysValidFor: {
      type: Number,
      required: true,
    },
    expireAt:{
      type:Date,
      required:true
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
