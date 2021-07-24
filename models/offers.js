const mongoose = require("mongoose");
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
    status:{
      type:String,
      enum: ['Valid','Expired'],
      required: true,
      default: 'Valid'
    }
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);
exports.Offer = Offer
