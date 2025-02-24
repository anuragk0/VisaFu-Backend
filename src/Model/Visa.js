const mongoose = require('mongoose');
const { Schema } = mongoose;

const visaSchema = new Schema({
    countryName: { type: String, required: true },
    price: { 
        INR: { type: String, required: true },
        USD: { type: String, required: true }
    },
    visaFuCharges: { 
        INR: { type: String, required: true },
        USD: { type: String, required: true }
    },
    heading: { type: String, required: true },
    tax: { 
        INR: { type: String, required: true },
        USD: { type: String, required: true }
    },
    visaImage: { type: String, required: true }, 
    faq: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    reviews: [{
        name: { type: String, required: true },
        location: { type: String, required: true },
        image: { type: String, required: true }, 
        rating: { type: Number, required: true },
        mainLine: { type: String, required: true },
        review: { type: String, required: true }
    }],
    overallRating: { type: Number, default: 0 }, 
    validationPeriod: { type: String, required: true },
    lengthOfStay: { type: String, required: true },
    entry: { type: String, default: 'Single' }, 
    documentRequirement: {
        passport: { type: Boolean, default: false },
        photo: { type: Boolean, default: false },
        usVisa: { type: Boolean, default: false }
    },
    visaType: { type: String, required: true },
    deliverDays: { type: String, required: true },
    cardHeading: { type: String, required: true },
    cardImage: { type: String, required: true }, 
    city: [{ type: String, required: true }], 
    visaType: { type: String, required: true },
    percentageOff: [{
        numOfTravel: { type: Number, required: true },
        percentageOff: { type: Number, required: true }
      }
    ]
});

// Validation to ensure at least one FAQ and one review are provided
visaSchema.path('faq').validate(function (faq) {
    return faq && faq.length > 0; // Must have at least one FAQ entry
}, 'At least one FAQ entry is required.');

visaSchema.path('reviews').validate(function (reviews) {
    return reviews && reviews.length > 0; // Must have at least one review entry
}, 'At least one review entry is required.');

const Visa = mongoose.model('Visa', visaSchema);

module.exports = Visa;