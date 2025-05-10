const mongoose = require("mongoose");
const { Schema } = mongoose;

const signUpSchema = new Schema({
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  otp: { type: String },
  otpCreatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: "user" },
});

module.exports = mongoose.model("SignUp", signUpSchema);