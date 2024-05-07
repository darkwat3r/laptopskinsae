const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require("../frameworks/aws");
var multerS3Transform = require('multer-s3-transform')
const sharp = require('sharp');

module.exports = {
    
    //Single File Upload
    uploadSingle: () => multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.S3_BUCKET,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            contentLength: 500000000,
            metadata: (req, file, cb) => {
                cb(null, {
                    fieldName: file.fieldname
                })
            },
            key: (req, file, cb) => {
                cb(null, 'users/profile-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname)
            },

        })
    }),

    //Generic File Upload
    uploadMultiple: () => multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.S3_BUCKET,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            contentLength: 500000000,
            metadata: (req, file, cb) => {
                //console.log(req.body);
                cb(null, {
                    fieldName: file.fieldname
                })
            },
            key: (req, file, cb) => {
                //console.log(req.body);
                console.log("File Upload Request", req.body.image_location);
                var file_location = 'blog/image-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                switch (req.body.image_location) {
                    case "custom":
                        file_location = 'custom/custom-skin-user-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                        break;                    
                    case "excursion_details":
                        file_location = 'excursions/ex_details-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                        break;
                    case 'things':
                        file_location = 'things/thing-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                        break;
                    case "blog_featured":
                        file_location = 'blog/featured-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                        break;
                    case "blog_block":
                        file_location = 'blog/block-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                        break;
                    default:
                        console.log("No Rewrite Path");
                        //console.log("Reading", file);
                        break;
                }

                cb(null, file_location)
            },
        })
    }),

    //Create Thumbnail and Upload
    uploadMultiplewithThumbs: () => multer({
        storage: multerS3Transform({
          s3: s3,
          bucket: process.env.S3_BUCKET,
          contentType: multerS3.AUTO_CONTENT_TYPE,
          shouldTransform: function (req, file, cb) {
            //console.log("Transform", req);
            cb(null, /^image/i.test(file.mimetype))
          },
          transforms: [{
            id: 'original',
            key: function (req, file, cb) {
                console.log("File Upload Request", req.body.image_location);
                var file_location = 'blog/image-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                switch (req.body.image_location) {
                    case "excursion_images":
                        file_location = 'excursions/ex_image-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                        break;
                    case "things":
                        file_location = 'things/thing-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                        break;                        
                }
                cb(null, file_location);                
            },
            transform: function (req, file, cb) {
              cb(
                null, 
                    sharp()
                    .jpeg()
                )
            }
          }, {
            id: 'thumbnail',
            key: function (req, file, cb) {
              console.log("File Upload Request", req.body.image_location);
              var file_location = 'blog/image-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
              switch (req.body.image_location) {
                  case "excursion_images":
                      file_location = 'excursions/ex_image_thumb-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                      break;
                  case "things":
                      file_location = 'things/thing-' + Date.now().toString() + '-' + Math.floor((Math.random() * 10000000) + 99999999) + '-' + file.originalname;
                      break;                       
              }              
              cb(null, file_location);
            },
            transform: function (req, file, cb) {
              cb(null, sharp().resize(300, 300).jpeg())
            }
          }]
        })
    }),    
    
    ///Delete S3 File
    deleteFileS3: async (path) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(path);
                var params = { Bucket: process.env.S3_BUCKET, Key: path };
                await s3.deleteObject(params).promise();
                resolve(true);               
            } catch (error) {
                reject(error);
            }
        });
    }          
}