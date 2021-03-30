'use strict';

// Dependencies
const https = require('https');
const querystring = require('querystring');
const config = require('./config');
const helpers = require('./helpers');
const constants = require('./constants');

const stripe = {};

stripe.performPayment = function (totalPrice, token, callback) {

    const payload = {
        amount: totalPrice*100,
        currency: 'usd',
        source: 'tok_lt',
        description: 'order description',
        metadata: { orderId: 'some order ID'}
    };

    const stringPayload = querystring.stringify(payload);

    const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.stripe.com',
        'method': 'post',
        'path': '/v1/charges',
        'auth': config.stripe.key,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload),
            'Authorization': 
            'Bearer ' + 'sk_test_51IZrGUGdqWtcA2Kl1DcM5glsyW2tnVyBVDRhWFG2utriJ6Apjkx2tFaTe3CMaSDHYAt3mW8CxblJe3fSIeejPP0B0003bh3OWK'
        }
    };

    const req = https.request(requestDetails, async function (res) {
        // Grab the status of the send request
        const status = res.statusCode;
       var responseString = '';

        await res.on('data', function (data) {
            responseString += data;
    // save all the data from response
        });

        console.log('response string', responseString)
        await res.on('end', function () {
            if (status === constants.HTTP_STATUS_OK || status === constants.HTTP_STATUS_CREATED) {
                const stripeResponsePayload = helpers.parseJsonToObject(responseString);
                callback(false, stripeResponsePayload);
            } else {
                callback('Status code returned was ' + status);
            }
        });
    });

    //Bind to the err event so it doesn't get thrown
    req.on('error', function (e) {
        callback(e);
    });

    req.write(stringPayload);

    req.end();
};

module.exports = stripe;