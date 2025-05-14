const ErrorHandling = require("../../utils/Errorhandling");
const catchAsyncError = require("../../middleware/catchAsyncError");
const crypto = require("crypto");
const { Cashfree } = require("cashfree-pg");
const Payment = require("../Model/Payment");
const { createVisaApplied } = require("../Service/VisaApplied");
const { generateInvoicePdfBuffer } = require("../../utils/GenerateInvoicePdfBuffer");
const  uploadFiletoS3  = require("../../utils/uploadFile");
const VisaApplied = require("../Model/VisaApplied");
const SendMail = require("../../utils/SendMail");
const fs = require("fs");
const path = require("path");

const { v4: uuidv4 } = require('uuid');

const generateInvoiceNo = () => {
  return 'INV-' + uuidv4().slice(0, 8); // short version
}

const generateAndSendInvoice = async (user, visaApplied) => {
  const invoiceNo = generateInvoiceNo();

  const data = {
    invoiceNo,
    date: new Date().toLocaleDateString('en-IN'),
    country: visaApplied?.visaId?.countryName,
    numTravellers: visaApplied?.numTravellers,
    totalVisaPrice: visaApplied?.fairValue?.totalAmount,
    totalVisaFuCharge: visaApplied?.fairValue?.visaFuCharge,
    subTotal: visaApplied?.fairValue?.totalAmount + visaApplied?.fairValue?.visaFuCharge,
    totalAddOnsCharge: visaApplied?.fairValue?.totalAddOnsCharge,
    grandTotal: visaApplied?.fairValue?.grandTotal,
    discount: visaApplied?.fairValue?.discount,
    currency: visaApplied?.fairValue?.currency,
    tax: visaApplied?.fairValue?.tax,
    name: user?.name
  };

  const filePath = path.join(__dirname, '..', 'Templates', 'invoice.html');
  const invoiceHtml = fs.readFileSync(filePath, 'utf8');
  const pdfBuffer = await generateInvoicePdfBuffer(invoiceHtml, data);

  const invoiceUrl = await uploadFiletoS3({
    data: pdfBuffer,
    name: `invoice-${invoiceNo}.pdf`,
    mimeType: "application/pdf",
  });

  await SendMail({
    to: user.email,
    subject: "🛠️ Visa in Progress – Invoice Inside!",
    text: `Hey ${user.name},
Awesome news – your visa is officially in process! 🧳✈️
We’re working on it, and in the meantime, here’s your invoice for the purchase. 🧾
  
This is a no-reply email (robots don’t make great pen pals 🤖),
so if you need anything at all, just drop us a line at support@visafu.com – we’ve got your back!
  
Thanks for choosing Visafu – your stress-free visa sidekick. 😎
  
Cheers,
The Visafu Team 🌍`,
    s3File: [
      {
        filename: `invoice-${invoiceNo}.pdf`,
        s3FileLink: invoiceUrl
      }
    ]
  });

  return invoiceUrl;
};



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

  const { amount, currency, visaAppliedDetail } = req.body;

  if (!amount || !currency) {
    return next(new ErrorHandling(400, "Amount and currency are required"));
  }

  if (amount <= 0) {
    return next(new ErrorHandling(400, "Amount must be greater than 0"));
  }

  if (!visaAppliedDetail) {
    return next(new ErrorHandling(400, "Visa applied detail is required"));
  }

  const user = req.user;

  let request = {
    order_amount: amount,
    order_currency: currency,
    order_id: generateOrderId(),
    customer_details: {
      customer_id: user._id,
      customer_phone: user.mobile,
    },
  };

  const response = await Cashfree.PGCreateOrder("2023-08-01", request);

  if (response.data && response.data.order_id) {
    const payment = response.data;
    const newPayment = new Payment({
      orderId: payment.order_id,
      amount: payment.order_amount,
      currency: payment.order_currency,
      customerId: payment.customer_details.customer_id,
    });

    const visaApplied = await createVisaApplied(visaAppliedDetail, saved_payment._id, user);

    if (!visaApplied) {
      return next(new ErrorHandling(400, "Visa applied detail is required"));
    }

    newPayment["visaAppliedId"] = visaApplied._id;
    const saved_payment = await newPayment.save();

    response.data["visaAppliedId"] = visaApplied._id;

    return res.status(200).send(response.data);
  } else {
    console.error("Unexpected Response from Cashfree:", response.data);
    return res.status(500).send({
      msg: "Unexpected response from Cashfree",
      data: response.data,
    });
  }


});

const cashfreePaymentVerify = catchAsyncError(async (req, res, next) => {
  let user = req.user;
  let { orderId } = req.body;

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

        if (payment.payment_status === "SUCCESS") {
          const visaApplied = await VisaApplied.findOne({
            _id: updatedPayment.visaAppliedId,
          });

          const invoice = await generateAndSendInvoice(user, visaApplied);

          updatedPayment["invoice"] = invoice;
        }
        await updatedPayment.save();

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

});

module.exports = {
  cashfreePayment,
  cashfreePaymentVerify,
};
