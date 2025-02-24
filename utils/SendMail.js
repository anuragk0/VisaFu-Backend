const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});


const SendMail = (options, res) => {
  const { to, subject, message, s3File } = options;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: message,
  };


  if (s3File && s3File.length > 0) {
    mailOptions["attachments"] = s3File.map((file) => ({
      filename: file.fileName, // Name of the file
      content: `Download the file using this link: ${file.s3FileLink}`, // S3 file link content
    }));
  }

  transporter.sendMail(mailOptions)
    .then((info) => {
      return res.status(200).send({
        message: 'Email sent successfully',
        info,
      });
    })
    .catch((error) => {
      return res.status(500).send({
        message: 'Failed to send email',
        error: error.message,
      });
    });
}

module.exports = SendMail;