const ErrorHandling = require("../../utils/Errorhandling");
const catchAsyncError = require("../../middleware/catchAsyncError");
const crypto = require("crypto");
const axios = require("axios");
// const Client = require("../Model/Client");
const { Cashfree } = require("cashfree-pg");
const Payment = require("../Model/Payment");

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
    // console.log("Running")
    const { amount, currency } = req.body;

    const user = req.user;

    let request = {
      order_amount: amount,
      order_currency: currency,
      order_id: await generateOrderId(),
      // order_note: "order note",
      customer_details: {
        customer_id: user._id,
        // customer_name: "kamlesh",
        // customer_email: "kamlesh@gmail.com",
        customer_phone: user.mobile,
      },
    };

    Cashfree.PGCreateOrder("2023-08-01", request)
      .then((response) => {
        // Check if Cashfree response is successful
        if (response.data && response.data.order_id) {
          return res.status(200).send(response.data);
        } else {
          console.error(`Unexpected Response: `, response.data);
          return res
            .status(500)
            .send({ msg: "Unexpected response from Cashfree" });
        }
      })
      .catch((err) => {
        console.error(`Cashfree Error: `, err);
        if (err.response && err.response.data) {
          return res.status(500).send({
            msg: "Cashfree Error",
            details: err.response.data,
          });
        } else {
          return res.status(500).send({ msg: "Unknown Cashfree Error" });
        }
      });
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
        console.log(`response: `, response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          const payment = response.data[0];

          const newPayment = new Payment({
            orderId: payment.order_id,
            cfPaymentId: payment.cf_payment_id,
            amount: payment.order_amount,
            currency: payment.payment_currency,
            status: payment.payment_status,
            paymentMethod: payment.payment_group,
            customerId: userId,
          });

          await newPayment.save();
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
