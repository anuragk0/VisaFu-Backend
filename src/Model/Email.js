const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  visaAppliedId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VisaApplied', 
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  subject: {
    type: String, 
    required: true
  },
  text: {
    type: String, 
    required: true
  },
  file: {
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /\.(pdf|png)$/.test(v); 
      },
      message: 'File must be in PDF or PNG format.'
    }
  },
  createdAt: {
    type: Date, 
    default: Date.now 
  }
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;