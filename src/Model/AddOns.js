const mongoose = require('mongoose');
const { Schema } = mongoose;

const addOnSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }, 
    price: { 
        INR: { type: String, required: true },
        USD: { type: String, required: true }
    },
    visaFuCharges: { 
        INR: { type: String, required: true },
        USD: { type: String, required: true }
    },
    tax: { 
        INR: { type: String, required: true },
        USD: { type: String, required: true }
    }
});

const AddOn = mongoose.model('AddOn', addOnSchema);

module.exports = AddOn;