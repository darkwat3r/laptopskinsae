require('dotenv').config();
const { s3 } = require("../frameworks/aws");



module.exports = (app) => {

    //List Categories with images
    app.get('/cats/list', async (req, res) => {
        try {

            const data = await s3.listObjectsV2({
                Bucket: process.env.S3_BUCKET,
                //MaxKeys: 2,
                Delimiter: '/',
                Prefix: "skins/"
            }).promise(); 

            console.log(data.CommonPrefixes);

            cats = [];
            data.CommonPrefixes.forEach(elem => {
                var category = elem.Prefix.replaceAll("skins/", "").replaceAll("/", "").replaceAll('_',' ');
                cats.push({
                    s3_url: elem.Prefix,
                    name: category
                });
                
            });
            cats = cats.sort((a, b) => a - b);
            
            console

            cats_array = [];
            for (let i = 0; i < cats.length; i++) {
                const elem = cats[i];
                
                const data = await s3.listObjectsV2({
                    Bucket: process.env.S3_BUCKET,
                    MaxKeys: 1,
                    Delimiter: '/',
                    Prefix: elem.s3_url
                }).promise();              
                
                baseURL = "https://images.laptopskins.ae/";

                console.log("Content", data.Contents);

                cats_array.push({
                    name: elem.name,
                    image: baseURL+ data.Contents[0].Key
                });

            }
            
            res.json({
                'success': true,
                'data': cats_array
            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Get Skins Categories
    app.get('/categories', async (req, res) => {
        try {

            const data = await s3.listObjectsV2({
                Bucket: process.env.S3_BUCKET,
                //MaxKeys: 2,
                Delimiter: '/',
                Prefix: "skins/"
            }).promise(); 

            //console.log(data.CommonPrefixes);

            cats = [];
            data.CommonPrefixes.forEach(elem => {
                var category = elem.Prefix.replaceAll("skins/", "").replaceAll("/", "").replaceAll('_',' ');
                cats.push(category);
                
            });
            cats = cats.sort((a, b) => a - b);

            res.json({
                'success': true,
                'data': cats
            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Get Specific Category Images
    app.get('/categories/:slug', async (req, res) => {
        category = req.params.slug;
        try {

            const data = await s3.listObjectsV2({
                Bucket: process.env.S3_BUCKET,
                //MaxKeys: 2,
                Delimiter: '/',
                Prefix: "skins/" + category + "/"
            }).promise(); 

            console.log(data);   
            //https://images.laptopskins.aeskins/abstract/LN48.jpg
            
            imageList = [];
            baseURL = "https://images.laptopskins.ae/";
            data.Contents.forEach(elem => {
                var url = baseURL + elem.Key;
                filename = url.substr(url.lastIndexOf("/")+1)
                name = filename.split('.').slice(0, -1).join('.');
                imageList.push({
                    url: url,
                    name: name,
                    code: name.replace('_',''),
                    category: category
                });
            });


            res.json({
                'success': true,
                'data': imageList
            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

}