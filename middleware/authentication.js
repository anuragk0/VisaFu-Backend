const ErrorHandling = require("../utils/Errorhandling");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../src/Model/User");
const isAuthentication = catchAsyncError(async (req, res, next) => {
  const { visaFuToken } = req.cookies;
  if (!visaFuToken) {
    return next(new ErrorHandling(401, "You have not logged In"));
  }

  const decodeToken = jwt.verify(visaFuToken, process.env.JWT_SECRET_ID);
  req.user = await User.findById(decodeToken.id);
  next();
});
const isAuthorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandling(
          403,
          `${req.user.role} has not permission to access this resource`
        )
      );
    }
    next();
  };
};
module.exports = { isAuthentication, isAuthorizeRole };
