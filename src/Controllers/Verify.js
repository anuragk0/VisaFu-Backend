const Visa = require('../Model/Visa');
const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const uploadFiletoS3 = require('../../utils/uploadFile');
const base64ToBuffer = require('../../utils/Base64ToBuffer');


const verifyDocument = catchAsyncError(async (req, res, next) => {
  
      let obj = {
        photoVerifyStatus: true,
        passportFrontVerifyStatus: true,
        passportBackVerifyStatus: true,
        passportData: {
           firstName: "Aryan",
           lastName: "Gupta",
           passportIssuedOn: "08/06/2021",
           passportValidTill: "08/06/2025",
           passportNumber: "V1674106",
           fatherName: "Girish Gupta",
           motherName: "Sadhna Gupta",
           dob: "01/01/2002",
           gender: "Male"
        },
        usVisaVerifyStatus: true,
        usVisaData:{
          passportNumber: "Z7606474",
          issueDate: "13Aug2024",
          expirationDate: "08Aug2034"
        }
      }

      setTimeout(()=>{
        res.status(200).json({
          data: obj
        })
      },10000);
      
});

module.exports = {verifyDocument};