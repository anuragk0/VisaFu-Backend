const { s3, PutObjectCommand } = require("./AWS/S3");
const { v4: uuidv4 } = require("uuid");

const uploadFiletoS3 = async (file) => {
  const uniqueKey = `${uuidv4()}-${file.name}`;

  const bufferData = Buffer.isBuffer(file.data)
    ? file.data
    : Buffer.from(file.data, "base64");

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: uniqueKey,
    Body: bufferData,
    ContentType: file.mimeType,
    ContentDisposition: "inline",
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  const fileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

  return fileUrl;
};

module.exports = uploadFiletoS3;