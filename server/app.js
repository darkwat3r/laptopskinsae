require('dotenv').config() //Development

//Web Server
    const express       = require('express');
    const bodyParser    = require('body-parser');
    const cors          = require('cors');
    const expressJWT    = require('express-jwt');

//Web Server
    const app   = express();
    const port  = process.env.PORT;
    const http  = require('http').Server(app);   
    
//CORS and Body Parser
    app.use(cors());
    app.options('*', cors());
    app.use(bodyParser.json({limit: '100mb', extended: true}));
    app.use(bodyParser.urlencoded({limit: "100mb", extended: true, parameterLimit:50000}));

//Routes
    require("./routes/health.js")(app);         //Health Check
    require("./routes/uploads.js")(app);        //Uploads
    require("./routes/users.js")(app);        //Users
    require("./routes/blog.js")(app);        //Blog
    require("./routes/listings.js")(app);        //Listings
    require("./routes/orders.js")(app);        //Listings

//Start Listening
    http.listen(port, () => {
        console.log('Listening: ' + port);
    });