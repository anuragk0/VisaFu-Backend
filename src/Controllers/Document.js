const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const Passport = require('../Model/Passport');
const Photo = require('../Model/Photo');
const UsVisa = require('../Model/UsVisa');



const getDocument = catchAsyncError(async (req, res, next) => {

    return res.status(200).json({

    });
});

module.exports = { getDocument };