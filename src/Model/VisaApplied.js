const mongoose = require("mongoose");
const { Schema } = mongoose;

const visaAppliedSchema = new Schema({
  visaId: { type: Schema.Types.ObjectId, ref: "Visa", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: Date, default: Date.now },
  departureDate: { type: String, required: true },
  numTravellers: { type: Number, required: true },
  visaDetails: [
    {
      passportId: {
        type: Schema.Types.ObjectId,
        ref: "Passport",
        required: true,
      },
      photoId: { type: Schema.Types.ObjectId, ref: "Passport", required: true },
      usVisaId: { type: Schema.Types.ObjectId, ref: "UsVisa" },
    },
  ],
  status: {
    type: String,
    enum: ["Ongoing", "Verification", "Submit", "Processing", "Finished"],
    default: "Ongoing",
  },
  // addOns: [{
  //     id: { type: Schema.Types.ObjectId, ref: 'AddOn' },
  //     total: { type: Number }
  // }],
  // fairValue: {
  //     totalAmount: { type: String, required: true },
  //     gst: { type: String, required: true },
  //     visaFuCharge: { type: String, required: true },
  //     totalAddOnsCharge: { type: String, required: true },
  //     grandTotal: { type: String, required: true },
  //     discount: { type: String, required: true }
  // },
  // paymentStatus: {
  //     type: String,
  //     enum: ['Pending', 'Paid', 'Failed'],
  //     default: 'Pending'
  // },
  emailId: [{ type: String }],
});

const VisaApplied = mongoose.model("VisaApplied", visaAppliedSchema);

module.exports = VisaApplied;
