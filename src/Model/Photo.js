const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  image: {
    type: String, 
    required: true
  },
  verified: {
    type: Boolean, 
    default: false 
  },
  uploadDate: {
    type: Date, 
    default: Date.now 
  }
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;