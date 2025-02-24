const express = require("express");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("../middleware/error");
const app = express();
const fileupload = require("express-fileupload");
var cors = require("cors");

//Config
if (process.env.NODE_ENV !== "Production") {
  require("dotenv").config({ path: "./config/config.env" });
}

//middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's URL
    credentials: true, // Allow cookies to be sent
  })
);

app.use(fileupload());
app.use(express.json({ limit: "1300kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Router
const user = require("../src/Router/User");
const visa = require("../src/Router/Visa");
const visaApplied = require("../src/Router/VisaApplied");
const addOns = require("../src/Router/AddOns");
const testimonial = require("../src/Router/Testimonial");
const verify = require("../src/Router/Verify");
const payment = require("../src/Router/Payment");

app.use("/api", user);
app.use("/api", visa);
app.use("/api", visaApplied);
app.use("/api", addOns);
app.use("/api", testimonial);
app.use("/api", verify);
app.use("/api", payment);

//Error middleware
app.use(errorMiddleware);
module.exports = app;
