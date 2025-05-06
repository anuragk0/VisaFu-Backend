const mongoose = require("mongoose");

const passportSchema = new mongoose.Schema({
  frontImage: {
    type: String, // URL or path to the front side image of the passport
    required: true,
  },
  backImage: {
    type: String, // URL or path to the back side image of the passport
    required: true,
  },
  details: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    sex: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const Passport = mongoose.model("Passport", passportSchema);

module.exports = Passport;
