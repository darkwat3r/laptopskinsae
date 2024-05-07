const { validateAdmin, validateUser } = require("../helpers/middleware");
const { uploadMultiple, uploadMultiplewithThumbs, deleteFileS3 } = require("../helpers/s3_upload");


module.exports = (app) => {


/**
 * @api {post} /upload/images/single Single Image Upload
 * @apiName SingleImageUpload
 * @apiGroup FileUpload
 * @apiPermission admin
 *
 * @apiParam {File} file Image file to upload.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          'success': true,
 *          'link': 'https://example.com/uploads/image.jpg'
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": false,
 *       "error": "Message from Server"
 *     }
 */
    //Generic File Upload API - Single
    app.post('/upload/images/single', validateUser, uploadMultiple().single('file'),  async (req, res) => {
        try {
            //User Upload Image
            console.log("Image", req.file.location);

            res.json({
                success: true,
                link: req.file.location //Froala Editor Variable
            });           
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });               
        }
    });


    /**
 * @api {post} /upload/images/multiple Multiple Image Upload
 * @apiName MultipleImageUpload
 * @apiGroup FileUpload
 * @apiPermission admin
 *
 * @apiParam {File[]} file[] Array of image files to upload. Maximum 24 files allowed.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          'success': true,
 *          'data': [
 *              {
 *                  "url": "https://example.com/uploads/image1.jpg",
 *                  "path": "uploads/image1.jpg"
 *              },
 *              {
 *                  "url": "https://example.com/uploads/image2.jpg",
 *                  "path": "uploads/image2.jpg"
 *              }
 *          ]
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": false,
 *       "error": "Message from Server"
 *     }
 */
    //Generic File Upload API - Multiple
    app.post('/upload/images/multiple', validateAdmin, uploadMultiple().array("file[]", 24),  async (req, res) => {
        console.log("Uploading Files");
        var data = [];
        req.files.map(
            (item) => {
                //console.log(item);
                data.push({
                    "url": item.location,
                    "path": item.key
                });
            }
        );
        
        res.json({
            'success': true,
            "data": data
        });
    });


/**
 * @api {post} /upload/images/multiple/thumbs Multiple Image Upload with Thumbnails
 * @apiName MultipleImageUploadWithThumbnails
 * @apiGroup FileUpload
 * @apiPermission admin
 *
 * @apiParam {File[]} file[] Array of image files to upload. Maximum 24 files allowed.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          'success': true,
 *          'data': [
 *              {
 *                  "thumbnail": "https://example.com/uploads/thumbnail1.jpg",
 *                  "original": "https://example.com/uploads/image1.jpg",
 *                  "path": {
 *                      "original": "uploads/image1.jpg",
 *                      "thumbnail": "uploads/thumbnail1.jpg"
 *                  }
 *              },
 *              {
 *                  "thumbnail": "https://example.com/uploads/thumbnail2.jpg",
 *                  "original": "https://example.com/uploads/image2.jpg",
 *                  "path": {
 *                      "original": "uploads/image2.jpg",
 *                      "thumbnail": "uploads/thumbnail2.jpg"
 *                  }
 *              }
 *          ]
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": false,
 *       "error": "Message from Server"
 *     }
 */
    
    //Generic File Upload API - Multiple with Thumbnails
    app.post('/upload/images/multiple/thumbs', validateAdmin, uploadMultiplewithThumbs().array("file[]", 24), (req, res) => {        
        console.log("Uploading Files");
        var data = [];
        req.files.map(
            (item) => {
                console.log(item);

                var original = item.transforms.find(obj=>obj.id==='original');
                var thumbnail = item.transforms.find(obj=>obj.id==='thumbnail');

                console.log(original);
                
                data.push({
                    "thumbnail": thumbnail.location,
                    "original": original.location,
                    "path": {
                        "original": original.key,
                        "thumbnail": thumbnail.key,
                    }
                });
            }
        );
        
        res.json({
            'success': true,
            "data": data
        });
    });    

    /* 
    //Delete Temporary Uploaded S3 File
    app.post('/public/upload/delete/temp/image', async (req, res) => {
        data = req.body;
        try {
            await deleteFileS3(data.thumbnail);
            await deleteFileS3(data.original);

            res.json({
                success: true
            });            
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });            
        }
    });
    */
}