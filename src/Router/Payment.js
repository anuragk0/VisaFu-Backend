const express = require("express");
const app = express.Router();
const {
  isAuthentication,
  isAuthorizeRole,
} = require("../../middleware/authentication");
const {
  cashfreePayment,
  cashfreePaymentVerify,
} = require("../Controllers/Payment");

// app.get("/create-checkout-session", getAllAddOns);
app.post("/cashfree-payment", isAuthentication, cashfreePayment);
app.post("/cashfree-payment-verify", isAuthentication, cashfreePaymentVerify);

module.exports = app;
