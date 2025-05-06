const ErrorHandling = require("../../utils/Errorhandling");
const catchAsyncError = require("../../middleware/catchAsyncError");
const crypto = require("crypto");
const axios = require("axios");
const { Cashfree } = require("cashfree-pg");
const Payment = require("../Model/Payment");
const { createVisaApplied } = require("./VisaApplied");

const newPayment = catchAsyncError(async (req, res, next) => {
  const merchantTransactionId = "M" + Date.now();
  const { name } = req.body;

  const data = {
    merchantId: process.env.MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: "MUID" + user._id,
    name: name,
    amount: price * 100,
    redirectUrl: `http://localhost:3000/api/checkStatus/${merchantTransactionId}`,
    redirectMode: "POST",
    mobileNumber: phone,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payload = JSON.stringify(data);
  const payloadMain = Buffer.from(payload).toString("base64");
  const keyIndex = 1;
  const string = payloadMain + "/pg/v1/pay" + process.env.SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;
  const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
  const options = {
    method: "POST",
    url: prod_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payloadMain,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      return res
        .status(200)
        .send({ url: response.data.data.instrumentResponse.redirectInfo.url });
    })
    .catch(function (error) {
      console.error(error);
    });
});

const checkStatus = catchAsyncError(async (req, res, next) => {
  const merchantTransactionId = req.params["txnId"];
  const merchantId = process.env.MERCHANT_ID;
  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    process.env.SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;
  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };
  // CHECK PAYMENT STATUS
  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {
        const result = await Client.updateOne(
          {
            "paymentHistory.merchantTransactionId":
              response.data.data.merchantTransactionId,
          },
          {
            $set: {
              "paymentHistory.$.status": "done",
            },
          }
        );

        return res.redirect("http://localhost:3000/thankyou");
      } else {
        return res
          .status(400)
          .send({ success: false, message: "Payment Failure" });
      }
    })
    .catch((err) => {
      res.status(500).send({ msg: err.message });
    });
});

const generateOrderId = () => {
  const uniqueId = crypto.randomBytes(16).toString("hex");

  const hash = crypto.createHash("sha256");
  hash.update(uniqueId);
  const hashedOrderId = hash.digest("hex");

  return hashedOrderId.slice(0, 12);
};

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // write PRODUCTION for live environment instead of SANDBOX

const cashfreePayment = catchAsyncError(async (req, res, next) => {
  try {
    const { amount, currency} = req.body;

    const user = req.user;

    let request = {
      order_amount: amount,
      order_currency: currency,
      order_id: await generateOrderId(),
      customer_details: {
        customer_id: user._id,
        customer_phone: user.mobile,
      },
    };

    try {
      const response = await Cashfree.PGCreateOrder("2023-08-01", request);

      if (response.data && response.data.order_id) {
        const payment = response.data;
        const newPayment = new Payment({
          orderId: payment.order_id,
          amount: payment.order_amount,
          currency: payment.order_currency,
          customerId: payment.customer_details.customer_id,
        });

        const saved_payment = await newPayment.save();
        
        const visaApplied = await createVisaApplied(req.body, saved_payment._id,user);

        console.log("Visa Applied Created:", visaApplied);
        response.data.visaAppliedId = visaApplied._id;

        return res.status(200).send(response.data);
      } else {
        console.error("Unexpected Response from Cashfree:", response.data);
        return res.status(500).send({
          msg: "Unexpected response from Cashfree",
          data: response.data,
        });
      }
    } catch (err) {
      console.error("Cashfree Error:", err);

      if (err.response && err.response.data) {
        return res.status(500).send({
          msg: "Cashfree Error",
          details: err.response.data,
        });
      } else {
        return res.status(500).send({ msg: "Unknown Cashfree Error" });
      }
    }
  } catch (error) {
    console.error(`Internal Server Error: `, error);
    res
      .status(500)
      .send({ msg: "Internal Server Error", details: error.message });
  }
});

const cashfreePaymentVerify = catchAsyncError(async (req, res, next) => {
  try {
    let { orderId } = req.body;
    let userId = req.user._id;

    Cashfree.PGOrderFetchPayments("2023-08-01", orderId)
      .then(async (response) => {

        if (Array.isArray(response.data) && response.data.length > 0) {
          const payment = response.data[0];

          const updatedPayment = await Payment.findOneAndUpdate(
            { orderId: payment.order_id },
            {
              cfPaymentId: payment.cf_payment_id,
              status: payment.payment_status,
              paymentMethod: payment.payment_group,
            },
            { new: true }
          );

          if (!updatedPayment) {
            return { success: false, message: "Order not found" };
          }
          return res.status(200).send(payment);
        } else {
          return res
            .status(404)
            .send({ message: "No payment found for this order" });
        }
      })
      .catch((err) => {
        console.log(`error: `, err);
        return res
          .status(500)
          .send(err.response?.data || { message: "Unknown error" });
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
  newPayment,
  checkStatus,
  cashfreePayment,
  cashfreePaymentVerify,
};
