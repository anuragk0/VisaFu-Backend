const User = require("../Model/User");
const Passport = require("../Model/Passport");
const Photo = require("../Model/Photo");
const ErrorHandling = require("../../utils/Errorhandling");
const catchAsyncError = require("../../middleware/catchAsyncError");
const generateOTP = require("../../utils/Otp");
const { snsClient, PublishCommand } = require("../../utils/AWS/SNS");
const sendToken = require("../../utils/SendToken");
const uploadFiletoS3 = require("../../utils/uploadFile");
const SignUp = require("../Model/SignUp");

const signUp = catchAsyncError(async (req, res, next) => {
  const { mobile, email } = req.body;

  if (!mobile || !email) {
    return next(new ErrorHandling(400, "mobile number or email is required"));
  }

  let user = await User.findOne({ mobile });

  // If user doesn't exist, create a new one
  if (user) {
    return next(new ErrorHandling(400, "user already exists"));
  }

  const otp = generateOTP();

  let newUser = await SignUp.findOneAndUpdate(
    { mobile },
    { mobile, email, otp },
    { new: true, upsert: true }
  );


  await newUser.save();

  const params = {
    Message: `Your VisaFu verification OTP is: ${otp}. This code will expire in 1 minute`,
    PhoneNumber: `+${mobile}`,
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Transactional",
      },
    },
  };

  console.log(params);

  const command = new PublishCommand(params);

  snsClient
    .send(command)
    .then((result) => {
      return res.status(200).send({
        message: "OTP send successfully",
      });
    })
    .catch((error) => {
      return res.status(500).send({
        message: "Error Sending OTP",
      });
    });
});

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
    return next(new ErrorHandling(400, "user not found"));
  } else {
    user.otp = otp;
    user.otpCreatedAt = new Date();
  }

  await user.save();

  const params = {
    Message: `Your VisaFu verification OTP is: ${otp}. This code will expire in 1 minute`,
    PhoneNumber: `+${mobile}`,
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Transactional",
      },
    },
  };

  console.log(params);

  const command = new PublishCommand(params);

  snsClient
    .send(command)
    .then((result) => {
      return res.status(200).send({
        message: "OTP send successfully",
      });
    })
    .catch((error) => {
      return res.status(500).send({
        message: "Error Sending OTP",
      });
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
  const { mobile, otp, page } = req.body;

  if (!mobile || !otp ) {
    return next(new ErrorHandling(400, "mobile number or otp is required"));
  }

  if (page === "signUp") {
    const user = await SignUp.findOne({ mobile });
    if (!user) {
      return next(new ErrorHandling(400, "user not found"));
    }
    
    if (isOtpExpired(user.otpCreatedAt)) {
      return next(new ErrorHandling(400, "otp is expired"));
    }
    if (user.otp !== otp) {
      return next(new ErrorHandling(400, "invalid otp"));
    }
    const newUser = new User({
      mobile,
      email: user.email
    });

    await newUser.save();
    await SignUp.deleteOne({ mobile });

    sendToken(newUser, res, 200);

  } else if (page === "signIn") {
    const user = await User.findOne({ mobile });

    if (!user) {
      return next(new ErrorHandling(400, "user not found"));
    }
  
    if (isOtpExpired(user.otpCreatedAt)) {
      return next(new ErrorHandling(400, "otp is expired"));
    }
  
    if (user.otp !== otp) {
      return next(new ErrorHandling(400, "invalid otp"));
    }
  
    sendToken(user, res, 200);
  }
  
});

//logged Out
const logOut = catchAsyncError(async (req, res, next) => {
  res.cookie("visaFuToken", "", {
    httpOnly: true,
    expires: new Date(0), // set to past
    sameSite: "None",     // if you're using cross-site cookies
    secure: true          // if using HTTPS
  }).json({
    success: true,
    message: "Successfully logged Out",
  });

});

// for updating profile
const updateProfile = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const userId = req.user._id;
  const user = await User.findById(userId).populate({
    path: "visaAppliedIds",
    populate: [
      { path: "visaDetails.passportId", model: "Passport" },
      { path: "visaDetails.photoId", model: "Photo" },
      { path: "visaId", model: "Visa" },
      { path: "paymentId", model: "Payment" }
    ],
  });

  if (email) {
    user.email = email;
  }

  await user.save();

  res.status(200).json({
    message: "Profile updated successfully",
    user,
  });
});

//getProfile
const getProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate({
    path: "visaAppliedIds",
    populate: [
      { path: "visaDetails.passportId", model: "Passport" },
      { path: "visaDetails.photoId", model: "Photo" },
      { path: "visaId", model: "Visa" },
      { path: "paymentId", model: "Payment" },
      //   { path: "visaDetails.usVisaId", model: "UsVisa", strictPopulate: false }, // optional one
    ],
  });
  res.status(200).send({
    user,
  });
});

//getUserProfile
const getUser = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate(
    "photoId passportId visaAppliedIds"
  );
  if (!user) {
    return next(new ErrorHandling(404, "User not found"));
  }
  res.status(200).send({
    user,
  });
});

const getUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find().populate("photoId passportId visaAppliedIds");
  res.status(200).send({
    users,
  });
});

module.exports = {
  signUp,
  verifyOtp,
  sendOtp,
  logOut,
  updateProfile,
  getProfile,
  getUser,
  getUsers,
};
