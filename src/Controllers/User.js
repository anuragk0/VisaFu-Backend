const User = require('../Model/User');
const Passport = require('../Model/Passport');
const Photo = require('../Model/Photo');
const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const generateOTP = require('../../utils/Otp');
const { snsClient, PublishCommand } = require('../../utils/AWS/SNS');
const sendToken = require('../../utils/SendToken');
const uploadFiletoS3 = require('../../utils/uploadFile');



// sendOtp || signUp
const sendOtp = catchAsyncError(async (req, res, next) => {
    const { mobile } = req.body;

    if (!mobile) {
        return next(new ErrorHandling(400, "mobile number is required"));
    }

    const otp = generateOTP();

    let user = await User.findOne({ mobile });

    // If user doesn't exist, create a new one
    if (!user) {
        user = new User({ mobile, otp, otpCreatedAt: new Date() });
    } else {
        user.otp = otp;
        user.otpCreatedAt = new Date();
    }

    await user.save();


    const params = {
        Message: `Your VisaFu verification OTP is: ${otp}. This code will expire in 1 minute`,
        PhoneNumber: `+${mobile}`,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Transactional'
            }
        }
    };

    console.log(params)

    const command = new PublishCommand(params);

    snsClient.send(command)
        .then((result) => {
            return res.status(200).send({
                message: 'OTP send successfully'
            })
        })
        .catch((error) => {
            return res.status(500).send({
                message: 'Error Sending OTP'
            })
        });

});



// check OTP validity
const isOtpExpired = (otpCreatedAt) => {
    const now = new Date();
    const diff = (now - otpCreatedAt) / 1000; // Difference in seconds
    return diff > 75; // 1 min 15 seconds = 75 seconds
};


// for verify Otp
const verifyOtp = catchAsyncError(async (req, res, next) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return next(new ErrorHandling(400, "mobile number or otp is required"));
    }


    const user = await User.findOne({ mobile });

    if (!user) {
        return next(new ErrorHandling(400, "user not found"));
    }

    if (isOtpExpired(user.otpCreatedAt)) {
        return next(new ErrorHandling(400, "otp is expired"));;
    }

    if (user.otp !== otp) {
        return next(new ErrorHandling(400, "invalid otp"));;
    }

    sendToken(user, res, 200);
})

//logged Out
const logOut = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.json({
        success: true,
        message: "Successfully logged Out"
    })
})



// for updating profile
const updateProfile = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    const passportDetails = JSON.parse(req.body.passportDetails);

    const user = req.user;

    if (email) {
        user.email = email;
    }

    let passportId = user.passportId;

    if (passportDetails && req.files && (req.files['passportFront'] || req.files['passportBack'])) {

        let frontImageUrl, backImageUrl;
        if (req.files['passportFront']) {
            frontImageUrl = await uploadFiletoS3(req.files['passportFront']);
        }
        if (req.files['passportBack']) {
            backImageUrl = await uploadFiletoS3(req.files['passportBack']);
        }

        let passport = passportId ? await Passport.findById(passportId) : new Passport();

        if (frontImageUrl) passport.frontImage = frontImageUrl;
        if (backImageUrl) passport.backImage = backImageUrl;

        if (passportDetails) {
            passport.details = {
                passportIssuedOn: passportDetails.passportIssuedOn || passport.details.passportIssuedOn,
                passportValidTill: passportDetails.passportValidTill || passport.details.passportValidTill,
                passportNumber: passportDetails.passportNumber || passport.details.passportNumber,
                fatherName: passportDetails.fatherName || passport.details.fatherName,
                motherName: passportDetails.motherName || passport.details.motherName,
                dob: passportDetails.dob || passport.details.dob,
                gender: passportDetails.gender || passport.details.gender,
                firstName: passportDetails.firstName || passport.details.firstName,
                lastName: passportDetails.lastName || passport.details.lastName
            };
        }

        await passport.save();
        passportId = passport._id;
    }

    let photoId = user.photoId;
    if (req.files && req.files['photo']) {
        const photoImageUrl = await uploadFiletoS3(req.files['photo']);

        let photo = photoId ? await Photo.findById(photoId) : new Photo();
        photo.image = photoImageUrl;
        await photo.save();

        photoId = photo._id;
    }

    if (passportId) {
        user.passportId = passportId;
    }
    if (photoId) {
        user.photoId = photoId;
    }

    await user.save();

    res.status(200).json({
        message: 'Profile updated successfully',
        user
    });
})

//getProfile
const getProfile = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('photoId passportId visaAppliedIds');
    res.status(200).send({
        user
    })
})

//getUserProfile
const getUser = catchAsyncError(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('photoId passportId visaAppliedIds');
    if (!user) {
        return next(new ErrorHandling(404, "User not found"));
    }
    res.status(200).send({
        user
    });
})

const getUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find().populate('photoId passportId visaAppliedIds');
    res.status(200).send({
        users
    });
})

module.exports = { verifyOtp, sendOtp, logOut, updateProfile, getProfile, getUser, getUsers};