const sendToken = (user, res, statusCode) => {
    const token = user.getJwtToken();
    
    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    res.status(statusCode)
        .cookie("visaFuToken", token, options)
        .json({
            success: true,
            user,
            token,
            message: "Successfully Login"
        });
};

module.exports = sendToken;