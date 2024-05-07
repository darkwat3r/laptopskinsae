require('dotenv').config() //Development

const { mongoClient } = require("../frameworks/mongoUtil");
const { ObjectID, ObjectId } = require('mongodb');
const { s3 } = require("../frameworks/aws");


async function start() {
    try {

        const data = await s3.listObjectsV2({
            Bucket: process.env.S3_BUCKET,
            //MaxKeys: 2,
            Delimiter: '/',
            Prefix: "skins/"
        }).promise(); 

        //console.log(data.CommonPrefixes);   
        
        data.CommonPrefixes.forEach(elem => {
            var msg = `
            <url>
                <loc>https://www.laptopskins.ae/${elem.Prefix.replace(/\/$/, "")}</loc>
                <lastmod>2024-03-02</lastmod>
                <changefreq>monthly</changefreq>
                <priority>1.0</priority>
            </url>            
            `;
            console.log(msg);
            //console.log(elem.Prefix.replace(/\/$/, ""))
        });


        /* 
        await mongoClient.connect();
        var blogCollection = mongoClient.db(process.env.DB).collection("things_categories");
        var results = await blogCollection
            .find({})
            //.project({ slug: 1, _id: 1 })
            .toArray();

        for (let i = 0; i < results.length; i++) {
            const elem = results[i];

            console.log("https://www.tripjojo.com/activities/category/" + elem.name);

        }
        */
    } catch (error) {
        console.log(error);
    }
}

start();