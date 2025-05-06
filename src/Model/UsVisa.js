const mongoose = require('mongoose');

const usVisaSchema = new mongoose.Schema({
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

const usVisa = mongoose.model('usVisa', usVisaSchema);

module.exports = usVisa;