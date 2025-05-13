const uploadFiletoS3 = require('../../utils/uploadFile');
const Passport = require('../Model/Passport');
const Photo = require('../Model/Photo');
const UsVisa = require('../Model/UsVisa');
const VisaApplied = require('../Model/VisaApplied');

const uploadDocuments = async (document, userId) => {
    let detail = {};

    if (document) {

        if (document.passport) {
            const { passportFrontImage, passportBackImage, passportDetails, verificationResult } = document.passport;

            const passportFrontImageUrl = await uploadFiletoS3(passportFrontImage);
            const passportBackImageUrl = await uploadFiletoS3(passportBackImage);

            const passportDoc = await Passport.create({
                frontImage: passportFrontImageUrl,
                backImage: passportBackImageUrl,
                details: passportDetails,
                userId: userId,
                verified: verificationResult
            });

            detail.passport = passportDoc;
        }

        if (document.photo) {

            const photoImageUrl = await uploadFiletoS3(document.photo);

            const photoDoc = await Photo.create({
                image: photoImageUrl,
                userId: userId,
                verified: "success"
            });

            detail.photo = photoDoc;
        }

        if (document.usVisa) {

            const usVisaImageUrl = await uploadFiletoS3(document.usVisa);

            const usVisaDoc = await UsVisa.create({
                image: usVisaImageUrl,
                userId: userId,
                verified: "success" 
            });

            detail.usVisa = usVisaDoc;
        }

    }

    return detail;
};

const createVisaApplied = async (detail, paymentId, user) => {
    const {
        visaId,
        departureDate,
        numTravellers,
        visaDetails,
        fairValue,
        deliveryDate
    } = detail;
     
    const userId = user._id;

    const newVisaApplied = new VisaApplied({
        visaId,
        userId,
        departureDate,
        numTravellers,
        visaDetails,
        fairValue,
        paymentId,
        deliveryDate
    });

    await newVisaApplied.save();
    user.visaAppliedIds.push(newVisaApplied._id);
    user.save();

    return newVisaApplied;
};

module.exports = {
    uploadDocuments,
    createVisaApplied
};