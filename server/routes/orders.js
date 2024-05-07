/* 
{
    "name": "Muhammad Bilal",
    "contact": "+971581242350",
    "address": "403 Apt Al Barsha B02",
    "city": "Dubai",
    "skins": [
        {
            "make": "Apple",
            "model": "Macbook 2014",
            "length": "10",
            "width": "8",
            "skin": {
                "url": "https://images.laptopskins.aeskins/anime/LN48.jpg",
                "name": "LN48",
                "category": "anime"
            }
        },
        {
            "make": "",
            "model": "",
            "length": "",
            "width": "",
            "skin": {
                "url": "https://images.laptopskins.aeskins/anime/LN48.jpg",
                "name": "LN48",
                "category": "anime"
            }
        },
        {
            "make": "",
            "model": "",
            "length": "",
            "width": "",
            "skin": {
                "url": "https://images.laptopskins.aeskins/anime/LN48.jpg",
                "name": "LN48",
                "category": "anime"
            }
        },
        {
            "make": "",
            "model": "",
            "length": "",
            "width": "",
            "skin": {
                "url": "https://images.laptopskins.aeskins/anime/LN48.jpg",
                "name": "LN48",
                "category": "anime"
            }
        },
        {
            "make": "Apple ",
            "model": "Macbook ",
            "length": "10",
            "width": "11",
            "skin": {
                "url": "https://images.laptopskins.aeskins/anime/LN50.jpg",
                "name": "LN50",
                "category": "anime"
            }
        }
    ]
}
*/

const { ObjectId } = require("mongodb");
const { mongoClient } = require("../frameworks/mongoUtil");
const { validateUser } = require("../helpers/middleware");
const moment = require('moment'); 
const { sendEmail, sendSMS } = require("../helpers/email/email");


module.exports = (app) => {

    var ordersCollection = mongoClient.db(process.env.DB).collection("orders");

    function capFirst(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    function createEmailTable(data) {
        let html = '<table border="1" style="width: 100%; border-collapse: collapse;">';
        html += ' \
            <tr> \
                <th style="text-align: center;">Skin</th> \
                <th style="text-align: center;">Code</th> \
                <th style="text-align: center;">Laptop</th> \
                <th style="text-align: center;">Price</th> \
            </tr> \
        ';
    
        data.skins.forEach(item => {
            html += `<tr>
                        <td style="text-align: center;"><a href="${item.skin.url}"><img style="width: 150px;" src="${item.skin.url}" /></a></td>
                        <td style="text-align: center;">
                            <div>${item.skin.name || ''}</div>
                            <div><a href="https://www.laptopskins.ae/skins/${item.skin.category}">${capFirst(item.skin.category)}</a></div>
                        </td>
                        <td style="text-align: center;">
                            <div>${item.make || ''} ${item.model || ''}</div>
                            <div>${item.width || ''} in. x ${item.length || ''} in.</div>
                        </td>
                        <td style="text-align: center;">AED 9.99</td>
                    </tr>`;
        });
        
        html += `
            <tr>
                <td colspan="3" style="text-align: right; margin-right: 10px;">Sub-Total</td>
                <td style="text-align: center;">${data.subtotal}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right; margin-right: 10px;">Shipping</td>
                <td style="text-align: center;">FREE</td>
            </tr>            
            <tr>
                <td colspan="3" style="text-align: right; margin-right: 10px;">Total</td>
                <td style="text-align: center;">${data.total}</td>
            </tr>            
        `;
        
        html += '</table>';
        return html;
    }    


    //Checkout
    app.post('/checkout', validateUser, async (req, res) => {
        data = req.body;
        try {

            //Create Connection
            await mongoClient.connect();

            //Sort Data
            skins = [];
            for (let i = 0; i < data.skins.length; i++) {
                const elem = data.skins[i];
                skin = {
                    laptop: {
                        make: elem.make,
                        model: elem.model
                    },
                    size: {
                        length: elem.length,
                        width: elem.width
                    },
                    url: elem.skin.url,
                    code: elem.skin.name,
                    category: elem.skin.category
                }
                skins.push(skin);
            }

            //Create Order
            order_date = moment().utc().toDate();
            order_id = await ordersCollection.estimatedDocumentCount() + 10000;
            results = await ordersCollection.insertOne({
                timestamp: order_date,
                order_id: order_id,
                skins: skins,
                shipping: {
                    name: data.name,
                    address: data.address,
                    city: data.city,
                    phone: data.contact
                },
                amount: {
                    subtotal: data.subtotal,
                    vat: data.vat,
                    shipping: data.shipping,
                    total: data.total
                },
                uid: req.USER.id
            });            

            res.json({
                'success': true,
                'order_id': order_id
            });

            
            //Booking Email
            msg = `
                <h1>Order Confirmation</h1>
                <p>Dear ${req.USER.name},</p>
                <p>Thank you for your order placed on ${moment(order_date).format('LLL')}. Your <b>Order ID #${order_id}</b> Here are the details of your order:</p>
            `;

            msg += createEmailTable(data);

            msg += `
                <p>Your Shipping details are as follows;</p>
                <p>
                    ${data.name}, <br>
                    ${data.address}, <br>
                    ${data.city}, <br>
                    ${data.contact}
                </p>
            `;

            msg += `
                <p>Please feel free to contact us for any queries, one of our representative will further assist you within 24~48 hours, your order is currently in <b>Review</b></p>
            `;

            //Order Email - User     
            await sendEmail(req.USER.email, 
                `Order Confirmation #${order_id} | Laptop Skins AE`,
                msg                    
                );

            await sendEmail("orders@laptopskins.ae", 
                `Customer Order #${order_id} | Laptop Skins AE`,
                msg                    
                );                

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Orders - Users
    app.post('/user/orders', validateUser, async (req, res) => {
        data = req.body;

        //Parameters        
        var pageSize = parseInt(data.pageSize);
        var currentPage = Math.max(0, data.page);

        try {
            //Fetch User Bookings
            var results = await ordersCollection
            .find({ uid: req.USER.id })
            .skip(pageSize * (currentPage - 1)) 
            .limit(pageSize)
            .sort({"timestamp": -1})            
            .toArray();


            const pageCount = await ordersCollection
                                .find({ uid: req.USER.id })   
                                .toArray();    
                                
            console.log("Page Count", pageCount.length);

            res.json({
                'success': true,
                'data': results,
                "pageCount": Math.round(pageCount.length / pageSize),
                "total": pageCount.length                 
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