
module.exports = (app) => {

    //Health Check
    /**
 * @api {get} / Check Server Status
 * @apiName CheckServerStatus
 * @apiGroup Server
 *
 * @apiSuccess {String} message Server status message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "message": "Server is Online - TripJoJo {version}"
 *     }
 */
    app.get('/', (req, res) => {
        res.send('Server is Online - TripJoJo ' + require('../package.json').version);
    });

    //Pings
    /**
 * @api {get} /private/ping Ping Private Endpoint
 * @apiName PingPrivateEndpoint
 * @apiGroup Ping
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 */
    app.get('/private/ping', (req, res) => {
        res.json({
            'success': true
        });
    });

    /**
 * @api {get} /public/ping Ping Public Endpoint
 * @apiName PingPublicEndpoint
 * @apiGroup Ping
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 */
    app.get('/public/ping', (req, res) => {
        res.json({
            'success': true
        });
    });
}