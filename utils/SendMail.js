const nodemailer = require('nodemailer');
const axios = require('axios');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SendMail = async (options) => {
  const { to, subject, text, s3File } = options;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    attachments: [],
  };

  if (s3File && s3File.length > 0) {
    for (const file of s3File) {
      const response = await axios.get(file.s3FileLink, { responseType: 'arraybuffer' });

      mailOptions.attachments.push({
        filename: file.filename,
        content: Buffer.from(response.data),
        contentType: 'application/pdf',
      });
    }
  }

  transporter.sendMail(mailOptions)
    .then((info) => console.log('Email sent: ', info.response))
    .catch((err) => console.error('Error sending email: ', err));
};

module.exports =  SendMail;