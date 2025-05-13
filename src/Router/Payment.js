const express = require("express");
const app = express.Router();
const { isAuthentication } = require("../../middleware/authentication");
const { cashfreePayment, cashfreePaymentVerify} = require("../Controllers/Payment");

app.post("/cashfree-payment", isAuthentication, cashfreePayment);
app.post("/cashfree-payment-verify", isAuthentication, cashfreePaymentVerify);

module.exports = app;
