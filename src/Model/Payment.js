const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    cfPaymentId: {
      type: String,
      // required: true
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILURE", "VOID", "INCOMPLETE", "FLAGGED", "CANCELLED","USER_DROPPED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      default: null,
      // required: false,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visaAppliedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisaApplied"
    },
    invoice: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
