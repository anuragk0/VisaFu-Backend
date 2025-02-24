const { s3, PutObjectCommand } = require('./AWS/S3');
const { v4: uuidv4 } = require('uuid');


const uploadFiletoS3 = async (file) => {
  // Generate a unique key using UUID
  const uniqueKey = `${uuidv4()}-${file.name}`;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: uniqueKey,
    Body: file.data,
    ContentType: file.mimeType,
    ContentDisposition: 'inline'
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  // Construct the URL for the uploaded file
  const fileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

  return fileUrl;

}

module.exports = uploadFiletoS3;