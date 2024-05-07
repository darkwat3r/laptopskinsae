require('dotenv').config();

const { ObjectId }                      = require('mongodb');
const { default: slugify }              = require('slugify');
const moment                            = require('moment'); 
const { validateAdmin } = require('../helpers/middleware');
const { mongoClient } = require("../frameworks/mongoUtil");


module.exports = (app) => {

    //Collections
    var blogCollection = mongoClient.db(process.env.DB).collection("blog");
    var blogCatCollection = mongoClient.db(process.env.DB).collection("blog_categories");

    //Set Featured Image
    /**
 * @api {post} /blog/set/image Set Featured Image
 * @apiName SetFeaturedImage
 * @apiGroup Blog
 * @apiDescription Set the featured image for a blog post.
 *
 * @apiHeader {String} Authorization Admin's access token prefixed with "Bearer ".
 *
 * @apiParam {String} id ID of the blog post.
 * @apiParam {String} type Type of the image ('wide' or 'block').
 * @apiParam {String} link URL link to the image.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/blog/set/image', validateAdmin, async (req, res) => {
        data = req.body;
        try {
            await mongoClient.connect();
            
            var results = await blogCollection
                            .updateOne(
                                { _id: new ObjectId(data.id) },
                                {
                                    $set: {
                                        image: {
                                            [(data.type === 'wide') ? "wide" : "block"] : data.link
                                        }
                                    }
                                }
                            );

            res.json({
                'success': true
            });

            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Public - Get Categories
    /**
 * @api {get} /public/blog/categories Get Blog Categories
 * @apiName GetBlogCategories
 * @apiGroup Blog
 * @apiDescription Retrieve the list of blog categories.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 * @apiSuccess {Object[]} data List of blog categories.
 * @apiSuccess {String} data.name Name of the blog category.
 * @apiSuccess {String} data.description Description of the blog category.
 * @apiSuccess {String} data.slug Slug of the blog category.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "data": [
 *              {
 *                  "name": "Category 1",
 *                  "description": "Description of Category 1",
 *                  "slug": "category-1"
 *              },
 *              {
 *                  "name": "Category 2",
 *                  "description": "Description of Category 2",
 *                  "slug": "category-2"
 *              }
 *          ]
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.get('/public/blog/categories', async (req, res) => {
        try {

            await mongoClient.connect();
            
            var results = await blogCatCollection
                            .find({})
                            .project({ name: 1, description: 1, slug: 1 })
                            .sort({ "name": 1 })
                            .toArray();

            res.json({
                success: true,
                data: results
            });

            //await mongoClient.close();        
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Public- Get Blog by Slug
    /**
 * @api {get} /public/blog/byslug/:slug Get Blog Post by Slug
 * @apiName GetBlogPostBySlug
 * @apiGroup Blog
 * @apiDescription Retrieve a blog post by its slug.
 *
 * @apiParam {String} slug Unique slug of the blog post.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 * @apiSuccess {Object} data The blog post data.
 * @apiSuccess {String} data.title Title of the blog post.
 * @apiSuccess {String} data.content Content of the blog post.
 * @apiSuccess {String} data.slug Slug of the blog post.
 * @apiSuccess {String} data.author Author of the blog post.
 * @apiSuccess {String} data.createdAt Date and time when the blog post was created.
 * @apiSuccess {String} data.updatedAt Date and time when the blog post was last updated.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "data": {
 *              "title": "Blog Post Title",
 *              "content": "Content of the blog post...",
 *              "slug": "blog-post-title",
 *              "author": "John Doe",
 *              "createdAt": "2024-04-20T10:30:00Z",
 *              "updatedAt": "2024-04-20T12:15:00Z"
 *          }
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.get("/public/blog/byslug/:slug", async (req, res) => {
        try {

            await mongoClient.connect();
            
            var results = await blogCollection
                .find({
                    "slug": req.params.slug
                })
                .toArray();
            
            res.json({
                success: true,
                data: results[0]
            });     

            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error
            });                
        }
    });    

    //Blog - List - Admin
    /**
 * @api {get} /public/blog/get/:page/:pageSize Get Blog Posts
 * @apiName GetBlogPosts
 * @apiGroup Blog
 * @apiDescription Retrieve a list of blog posts.
 *
 * @apiParam {Number} page Page number for pagination.
 * @apiParam {Number} pageSize Number of blog posts per page.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 * @apiSuccess {Array} data Array of blog posts.
 * @apiSuccess {String} data.title Title of the blog post.
 * @apiSuccess {String} data.content Content of the blog post.
 * @apiSuccess {String} data.slug Slug of the blog post.
 * @apiSuccess {String} data.author Author of the blog post.
 * @apiSuccess {String} data.createdAt Date and time when the blog post was created.
 * @apiSuccess {String} data.updatedAt Date and time when the blog post was last updated.
 * @apiSuccess {Number} pageCount Total number of pages.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "data": [
 *              {
 *                  "title": "Blog Post Title 1",
 *                  "content": "Content of the blog post 1...",
 *                  "slug": "blog-post-title-1",
 *                  "author": "John Doe",
 *                  "createdAt": "2024-04-20T10:30:00Z",
 *                  "updatedAt": "2024-04-20T12:15:00Z"
 *              },
 *              {
 *                  "title": "Blog Post Title 2",
 *                  "content": "Content of the blog post 2...",
 *                  "slug": "blog-post-title-2",
 *                  "author": "Jane Smith",
 *                  "createdAt": "2024-04-21T09:45:00Z",
 *                  "updatedAt": "2024-04-21T11:20:00Z"
 *              }
 *          ],
 *          "pageCount": 5
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.get('/public/blog/get/:page/:pageSize', async (req, res) => {
        
        //Parameters        
        var pageSize = parseInt(req.params.pageSize);
        var currentPage = Math.max(0, req.params.page);       

        try {
            
            await mongoClient.connect();
            
            var news = await blogCollection
                .find({})
                .project({ _id: 0 })
                .skip(pageSize * (currentPage - 1)) 
                .limit(pageSize)
                .sort({"timestamp": -1})
                .toArray();

            //Page Count
            const pageCount = await blogCollection.countDocuments();

            res.json({
                'success': true,
                'data': news,
                "pageCount": Math.round(pageCount / pageSize)
            });  

            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error
            });
        }
    });      

    //Create New Category
    /**
 * @api {post} /admin/blog/create/category/set Set Blog Category for Post
 * @apiName SetBlogCategory
 * @apiGroup Blog
 * @apiDescription Set the category for a blog post.
 *
 * @apiHeader {String} Authorization User's access token prefixed with 'Bearer'.
 *
 * @apiParam {String} id The ID of the blog post to update.
 * @apiParam {String} title The title of the category.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/admin/blog/create/category/set', validateAdmin, async (req, res) => {
        data = req.body;
        try {

            var unique_name = Date.now().toString() + '-' + Math.floor((Math.random() * 1000) + 9999);
            var slug = slugify(data.title) + "-" + unique_name;    
            
            await mongoClient.connect();

            //Update News by Object ID
            var results = await blogCollection
                                .updateOne(
                                    { _id: ObjectID(data.id) },
                                    {
                                        $set: {
                                            category: {
                                                title: data.title,
                                                slug: slug
                                            }
                                        }
                                    }
                                );
            
            //Verify Query
            if (!results.acknowledged) {
                //await mongoClient.close();
                throw new Error("Database Query Error");
            }                                

            res.json({
                success: true
            });
            
            //Graceful Exit
            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Blog - Admin - Setting New Category
    /**
 * @api {post} /admin/blog/set/category Set Blog Category
 * @apiName SetBlogCategory
 * @apiGroup Blog
 * @apiDescription Set the category for a blog post.
 *
 * @apiHeader {String} Authorization User's access token prefixed with 'Bearer'.
 *
 * @apiParam {String} id The ID of the blog post to update.
 * @apiParam {Object} category The category object containing title and slug.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/admin/blog/set/category', validateAdmin, async (req, res) => {
        data = req.body;
        try {

            await mongoClient.connect();
            
            var results = await blogCollection.updateOne(
                { _id: ObjectId(data.id)},
                {
                    $set: {
                        "category": data.category
                    }
                }
            );

            //Verify Query
            if (!results.acknowledged) {
                //await mongoClient.close();
                throw new Error("Database Query Error");
            }                   

            res.json({
                success: true
            });
            
            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Blog - List - Admin
    /**
 * @api {get} /admin/blog/get/:page/:pageSize Get Blog Posts
 * @apiName GetBlogPosts
 * @apiGroup Blog
 * @apiDescription Retrieve a list of blog posts for administration purposes.
 *
 * @apiHeader {String} Authorization User's access token prefixed with 'Bearer'.
 *
 * @apiParam {Number} page The page number.
 * @apiParam {Number} pageSize The number of blog posts to fetch per page.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 * @apiSuccess {Array} data An array of blog post objects.
 * @apiSuccess {Number} pageCount The total number of pages available.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "data": [
 *              {
 *                  // Blog post object
 *              },
 *              {
 *                  // Blog post object
 *              }
 *          ],
 *          "pageCount": 5
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.get('/admin/blog/get/:page/:pageSize', async (req, res) => {
        
        //Parameters        
        var pageSize = parseInt(req.params.pageSize);
        var currentPage = Math.max(0, req.params.page);       

        try {
            
            await mongoClient.connect();
            
            //Remove ID
            //const projection = { _id: 0 };
            var news = await blogCollection.find({})
                //.project(projection)
                .skip(pageSize * (currentPage - 1)) 
                .limit(pageSize)
                .sort({"timestamp": -1})
                .toArray();

            //Page Count
            const pageCount = await blogCollection.countDocuments();

            res.json({
                'success': true,
                'data': news,
                "pageCount": Math.round(pageCount / pageSize)
            });  

            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error
            });
        }
    });    
    
    //Blog - Delete
    /**
 * @api {post} /admin/blog/delete Delete Blog Post
 * @apiName DeleteBlogPost
 * @apiGroup Blog
 * @apiDescription Delete a blog post by its ID.
 *
 * @apiHeader {String} Authorization User's access token prefixed with 'Bearer'.
 *
 * @apiParam {String} id ID of the blog post to delete.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/admin/blog/delete', validateAdmin, async (req, res) => {
        data = req.body;
        try {
            await mongoClient.connect();

            var results = await blogCollection
                                    .deleteOne({ _id:ObjectID(data.id) });            

            if (!results.acknowledged) {
                //await mongoClient.close();
                throw new Error("Database Query Error");
            }

            res.json({
                success: true
            });  
            
            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });               
        }
    });    
    
    //Blog - Edit Post
    /**
 * @api {post} /admin/blog/update Update Blog Post
 * @apiName UpdateBlogPost
 * @apiGroup Blog
 * @apiDescription Update a blog post by its ID.
 *
 * @apiHeader {String} Authorization User's access token prefixed with 'Bearer'.
 *
 * @apiParam {String} id ID of the blog post to update.
 * @apiParam {String} title Title of the blog post.
 * @apiParam {String} slug Unique slug for the blog post.
 * @apiParam {String} details Content/details of the blog post.
 * @apiParam {String} featured URL of the featured image thumbnail.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/admin/blog/update', validateAdmin, async (req, res) => {
        data = req.body;
        try {

            //Get News Article from ObjectID
            await mongoClient.connect();

            //Update News by Object ID
            var results = await blogCollection
                                .updateOne(
                                    { _id:ObjectID(data.id) },
                                    {
                                        $set: {
                                            title: data.title,
                                            slug: data.slug,
                                            details: data.details,
                                            "featured": {
                                                "thumbnail": data.featured
                                            }
                                        }
                                    }
                                );

            if (!results.acknowledged) {
                //await mongoClient.close();
                throw new Error("Database Query Error");
            }

            res.json({
                success: true
            });

            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });               
        }
    });    
    
    //Blog - New Post
    /**
 * @api {post} /admin/blog/new Create New Blog Post
 * @apiName CreateNewBlogPost
 * @apiGroup Blog
 * @apiDescription Create a new blog post.
 *
 * @apiHeader {String} Authorization User's access token prefixed with 'Bearer'.
 *
 * @apiParam {String} title Title of the blog post.
 * @apiParam {String} details Content/details of the blog post.
 * @apiParam {String[]} categories Array of category IDs associated with the blog post.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/admin/blog/new', validateAdmin, async (req, res) => {
        data = req.body;
        try {

            var unique_name = Date.now().toString() + '-' + Math.floor((Math.random() * 1000) + 9999);
            var slug = slugify(data.title.toLowerCase()) + "-" + unique_name;    
            slug = slug.replace(/[!'()*]/g,'');
            
            await mongoClient.connect();

            //Fix Thumbnail
            /* 
            var featured = data.featured;
            if (data.featured == "./assets/no_image_placeholder.png") {
                featured = null;
            }
            */

            var results = await blogCollection.insertOne({
                timestamp: moment().utc().toDate(),
                title: data.title,
                slug: slug, 
                details: data.details,
                categories: data.categories
                /* 
                "featured": {
                    "thumbnail": data.featured
                }
                */
            });

            if (!results.acknowledged) {
                //await mongoClient.close();
                throw new Error("Database Query Error");
            }

            res.json({
                success: true
            });
            
            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });               
        }
    });
    
    //Blog - Get Specific News
    /**
 * @api {get} /admin/blog/edit/get/:id Get Blog Post for Editing
 * @apiName GetBlogPostForEditing
 * @apiGroup Blog
 * @apiDescription Get a blog post for editing by its ID.
 *
 * @apiHeader {String} Authorization User's access token prefixed with 'Bearer'.
 *
 * @apiParam {String} id ID of the blog post to be retrieved for editing.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 * @apiSuccess {Object} data Details of the blog post retrieved for editing.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "data": {
 *              "_id": "123456789abcdef", // ID of the blog post
 *              "title": "Title of the blog post",
 *              "details": "Content/details of the blog post",
 *              "categories": ["category_id1", "category_id2"],
 *              "timestamp": "2024-04-18T12:00:00Z" // Timestamp of creation
 *          }
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.get('/admin/blog/edit/get/:id', validateAdmin, async (req, res) => {
        news_id = req.params.id;
        try {
            await mongoClient.connect();
            
            var results = await blogCollection
                                .findOne({ _id:ObjectID(news_id) });
            
            if (!results) {
                //await mongoClient.close();
                throw new Error("No News Found");
            }

            res.json({
                success: true,
                data: results
            });

            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error
            });
        }
    });    

}

/* 
//Public - Blog - GET
app.post('/public/blog/get', async (req, res) => {
    
    data = req.body;

    //Parameters        
    var pageSize = parseInt(data.page.pageSize);
    var currentPage = Math.max(0, data.page.page);         

    try {
        
        await mongoClient.connect();
        
        //Remove ID
        //const projection = { _id: 0 };
        var news = await blogCollection
            .find(data.category || {})
            .project({ _id: 0 }) //Remove ID
            .skip(pageSize * (currentPage - 1)) 
            .limit(pageSize)
            .sort({"timestamp": -1})
            .toArray();

        //Page Count
        const pageCount = await blogCollection.countDocuments();

        res.json({
            'success': true,
            'data': news,
            "pageCount": Math.round(pageCount / pageSize)
        });  

        //await mongoClient.close();
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            error: error
        });
    }
});    
*/