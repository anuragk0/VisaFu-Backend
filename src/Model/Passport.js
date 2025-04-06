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
    // passportIssuedOn: {
    //   type: Date,
    //   required: true
    // },
    passportValidTill: {
      type: Date,
      required: true,
    },
    passportNumber: {
      type: String,
      required: true,
      unique: true,
    },
    // fatherName: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // motherName: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
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
