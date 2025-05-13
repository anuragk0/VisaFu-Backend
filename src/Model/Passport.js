const mongoose = require("mongoose");
const { Schema } = mongoose;

const passportSchema = new mongoose.Schema({
  frontImage: {
    type: String, // URL or path to the front side image of the passport
    required: true,
  },
  backImage: {
    type: String, // URL or path to the back side image of the passport
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  details: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    expirationDate: {
      type: String
    },
    issueDate:{
      type: String
    },
    fileNumber: {
      type: String
    },
    birthDate: {
      type: String
    },
    sex: {
      type: String
    },
    district: {
      type: String
    },
    fatherName: {
      type: String
    },
    passportNumber: {
      type: String
    },
    motherName: {
      type: String  
    },
    nationality: {
      type: String
    },
    pincode: {
      type: String
    },
    address: {
      type: String
    },
    state: {
      type: String
    }

  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: String,
    enum: ["success", "failed"],
    default: "failed"
  },
});

const Passport = mongoose.model("Passport", passportSchema);

module.exports = Passport;
