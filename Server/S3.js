require("dotenv").config();
const fs = require("fs");
const { Readable } = require('stream');
const S3 = require("aws-sdk/clients/s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const acesKey = process.env.AWZ_ACCES_KEY;
const secretKey = process.env.AWZ_SECRET_KEY;

const s3 = new S3({
  bucketName: bucketName,
  endpoint: 'https://s3.us-east-1.amazonaws.com',
  region: region,
  accessKeyId: acesKey,
  secretAccessKey: secretKey,
});

//for upload
module.exports.upload = (file) => {
  return new Promise((resolve, reject) => {
    const uploadParams = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
    }
    s3.upload(uploadParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
//for download

module.exports.download = (file) => {
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: bucketName,
        Key: file.Body,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {

          resolve(data);
        }
      }
    );
  });
};
