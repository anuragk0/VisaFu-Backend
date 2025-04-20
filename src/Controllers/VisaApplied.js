const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const uploadFiletoS3 = require('../../utils/uploadFile');
const Passport = require('../Model/Passport');
const Photo = require('../Model/Photo');
const VisaApplied = require('../Model/VisaApplied');

// upload documents 
const uploadDocuments = async (documents) => {
    const visaDetails = [];

    for (const document of documents) {
        const detail = {};

        // Handling Passport
        if (document.passport) {
            const { passportFrontImage, passportBackImage, passportDetails } = document.passport;

            const passportFrontImageUrl = await uploadFiletoS3(passportFrontImage);
            const passportBackImageUrl = await uploadFiletoS3(passportBackImage);

            const passportDoc = await Passport.create({
                frontImage: passportFrontImageUrl,
                backImage: passportBackImageUrl,
                details: passportDetails
            });

            detail.passportId = passportDoc._id;
        }

        // Handling Photo
        if (document.photo) {
            const { photoImage } = document.photo;

            const photoImageUrl = await uploadFiletoS3(photoImage);

            const photoDoc = await Photo.create({
                image: photoImageUrl
            });

            detail.photoId = photoDoc._id;
        }

        // Handling US Visa
        if (document.usVisa) {
            const { usVisaImage, usVisaDetails } = document.usVisa;

            const usVisaImageUrl = await uploadFiletoS3(usVisaImage);

            const usVisaDoc = await UsVisa.create({
                image: usVisaImageUrl,
                details: usVisaDetails
            });

            detail.usVisaId = usVisaDoc._id;
        }
   
        visaDetails.push(detail);
    }

    return visaDetails;
};

// Create new Visa Applied
const createVisaApplied = catchAsyncError(async (req, res, next) => {
    const {
        visaId,
        departureDate,
        numberOfTravellers,
        documents,
        addOns,
        fairValue,
        paymentStatus,
    } = req.body;
     
    const userId = req.user._id;
    const visaDetails = uploadDocuments(documents);

    const newVisaApplied = new VisaApplied({
        visaId,
        userId,
        departureDate,
        numberOfTravellers,
        visaDetails,
        addOns: addOns || [],
        fairValue,
        paymentStatus,
    });

    await newVisaApplied.save();
    let user = req.user;
    user.visaAppliedId.push(newVisaApplied._id);
    user.save();
    res.status(201).json({
        message: 'Visa application created successfully',
        data: newVisaApplied
    });
});

const updateStatus = catchAsyncError( async (req,res,next)=>{
    const { visaAppliedId } = req.params; 
    const { status } = req.body; 

    // Validating the status value
    const validStatuses = ['Ongoing', 'Verification', 'Submit', 'Processing', 'Finished'];
    if (!validStatuses.includes(status)) {
        return next(new ErrorHandling(400, "Invalid status value. Allowed values are: 'Ongoing', 'Verification', 'Submit', 'Processing', 'Finished'" ));
    }

    const visaApplied = await VisaApplied.findByIdAndUpdate(
        visaAppliedId, 
        { status },
        { new: true }
    );

    // If no visa application is found
    if (!visaApplied) {
        return next(new ErrorHandling(404,"Visa application not found" ));
    }

    return res.status(200).json({ message: "Visa application status updated successfully", visaApplied });
})

module.exports = {createVisaApplied, updateStatus};