const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const Photo = require('../Model/Photo');

const verifyPhoto = catchAsyncError(async (req,res,next)=>{

});


module.exports = {verifyPhoto}