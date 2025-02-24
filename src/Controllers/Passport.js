const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');

const verifyPassport = catchAsyncError(async (req,res,next)=>{

});

module.exports = {verifyPassport}