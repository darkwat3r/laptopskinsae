const AWS = require('aws-sdk');

//AWS
    AWS.config.update({
        accessKeyId: process.env.ACCESS_ID,
        secretAccessKey: process.env.ACCESS_KEY,
        region: process.env.REGION,
        httpOptions: {
            timeout: 0
        }        
    });

//S3
    const s3 = new AWS.S3({
        accessKeyId: process.env.ACCESS_ID,
        secretAccessKey: process.env.ACCESS_KEY,
        region: process.env.REGION,
        signatureVersion: "v4"
    });    

module.exports = Object.freeze({
   AWS: AWS,
   s3: s3 
});