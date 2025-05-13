const mongoose = require('mongoose');
const { Schema } = mongoose;

const photoSchema = new mongoose.Schema({
  image: {
    type: String, 
    required: true
  },
  verified: {
    type: String,
    enum: ["success", "failed"],
    default: "failed"
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: {
    type: Date, 
    default: Date.now 
  }
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;