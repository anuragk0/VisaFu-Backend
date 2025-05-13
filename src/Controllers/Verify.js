const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const {extractPassportData, verifyPassportDetails, formatDob} = require('../Service/Verify');
const {uploadDocuments} = require('../Service/VisaApplied');


const verifyDocument = catchAsyncError(async (req, res, next) => {
    const { document } = req.body;

    const { user } = req;

    if (!document) return next(new ErrorHandling(400, "Document is required"));

    const { passport, photo } = document;

    if (!passport || !photo)
        return next(new ErrorHandling(400, "passport and photo is required"));

    const { passportFrontImage, passportBackImage } = passport;

    if (!passportFrontImage || !passportBackImage)
        return next(new ErrorHandling(400, "passport front and back image is required"));

    // Step 1: Extract Data from Passport
    if (!passportFrontImage?.data || !passportBackImage?.data)
        return next(new ErrorHandling(400, "passport front and back image data is required"));

    const extractedData = await extractPassportData(passportFrontImage?.data, passportBackImage?.data);

    if (!extractedData || extractedData?.status !== "completed")
        return next(new ErrorHandling(400, "OCR failed to extract data"));

    

    const fileNo = extractedData?.result?.extraction_output?.file_number;;
    const dob = extractedData?.result?.extraction_output?.date_of_birth;

    if (!fileNo || !dob)
        return next(new ErrorHandling(400, "Failed to extract file number or date of birth"));

    // Step 2: Passport Verification
    const verificationResult = await verifyPassportDetails(fileNo, formatDob(dob));

    let passportDetails = {
        firstName: extractedData?.result?.extraction_output?.first_name,
        lastName: extractedData?.result?.extraction_output?.last_name, 
        expirationDate: extractedData?.result?.extraction_output?.date_of_expiry,
        issueDate: extractedData?.result?.extraction_output?.date_of_issue,
        fileNumber: extractedData?.result?.extraction_output?.file_number,
        birthDate: extractedData?.result?.extraction_output?.date_of_birth,
        sex: extractedData?.result?.extraction_output?.gender,
        district: extractedData?.result?.extraction_output?.district,
        fatherName: extractedData?.result?.extraction_output?.father_name,
        passportNumber: extractedData?.result?.extraction_output?.id_number,
        motherName: extractedData?.result?.extraction_output?.mother_name,
        nationality: extractedData?.result?.extraction_output?.nationality,
        pincode: extractedData?.result?.extraction_output?.pincode,
        address: extractedData?.result?.extraction_output?.address,
        state: extractedData?.result?.extraction_output?.state
    }

    passport["passportDetails"] = passportDetails;
    passport["verificationResult"] = verificationResult?.status === "success" ? "success" : "failed";
    
    // Step 3: Upload Documents
    const details = await uploadDocuments(document, user._id);

    return res.status(200).json({
        message: "Document verified successfully",
        details: details
    });
});

module.exports = { verifyDocument };