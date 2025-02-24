const express = require("express");
const { sendContactForm } = require("../controllers/Contact");
const router = express.Router();

router.post("/contact", sendContactForm);

module.exports = router;
