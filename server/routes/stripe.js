const { validateUser } = require('../helpers/middleware');

const stripe = require('stripe')(process.env.STRIPE_KEY);

module.exports = (app) => {

    /**
 * @api {post} /payment/stripe/intent Create Stripe Payment Intent
 * @apiName CreateStripePaymentIntent
 * @apiGroup Payment
 * @apiPermission user
 *
 * @apiParam {Object} data Payment data.
 * @apiParam {Number} data.amount Amount of the payment.
 * @apiParam {String} data.booking_id Booking ID associated with the payment.
 *
 * @apiSuccess {Object} paymentIntent Created payment intent object.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          // Payment intent object
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": false,
 *       "error": "Message from Server"
 *     }
 */
    app.post('/payment/stripe/intent', validateUser, async (req, res) => {
        data = req.body;
        console.log(data);
        try {

            const paymentIntent = await stripe.paymentIntents.create({
                amount: data.amount,
                currency: 'aed',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    booking_id: data.booking_id
                }
            });             

            res.json(paymentIntent);
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

}