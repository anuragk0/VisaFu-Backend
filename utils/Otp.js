const generateOTP = () => {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < process.env.OTP_LENGTH; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

module.exports = generateOTP