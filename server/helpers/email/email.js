const AWS = require('aws-sdk');
const ejs = require('ejs');
const fs = require('fs');



module.exports = {
    sendSMS: (phone, msg) => {
        var params = {
            Message: msg,
            PhoneNumber: phone
        };

        AWS.config.update({
            accessKeyId: process.env.ACCESS_ID,
            secretAccessKey: process.env.ACCESS_KEY,
            region: process.env.REGION
        });
        
        return new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    },
    sendAdminEmail: (email, subject, msg) => {
        var params = {
            Destination: {
                ToAddresses: [
                    email
                ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: msg
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: msg
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            Source: process.env.EMAIL,
            ReplyToAddresses: [
                process.env.EMAIL
            ],
        };        

        AWS.config.update({
            accessKeyId: process.env.ACCESS_ID,
            secretAccessKey: process.env.ACCESS_KEY,
            region: process.env.REGION
        });               

        return new AWS.SES().sendEmail(params).promise();                
    },
    sendEmail: (email, subject, msg) => {

        var template = fs.readFileSync('./helpers/email/email.html', { encoding: 'utf-8' });        
        var htmlTemplate = ejs.render(template, { "msg": msg });        

        var params = {
            Destination: {
                ToAddresses: [
                    email
                ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: htmlTemplate
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: msg
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            Source: process.env.EMAIL,
            ReplyToAddresses: [
                process.env.EMAIL
            ],
        };        

        AWS.config.update({
            accessKeyId: process.env.ACCESS_ID,
            secretAccessKey: process.env.ACCESS_KEY,
            region: process.env.REGION
        });        

        return new AWS.SES().sendEmail(params).promise();                
    }
}