var http = require('http');
var url = require('url');
var handlers = require('./handlers')
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var helpers = require('./helpers');
var https = require('https');
var fs = require('fs');

var menu = [{name: "Margarita", price: 5.99}, {name: "Capricciosa", price: 7.99}, {name: "Pepperoni", price: 8.99}, {name: "Scones", price: 3.99}, {name: "Calzone", price: 8.99}, {name:"Chicago", price: 10.99}, {name: "Beverage", price: 1.99}]


 // Instantiate the HTTP server
 var httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
  });
  
  // Start the HTTP server
  httpServer.listen(config.httpPort,function(){
    console.log('The HTTP server is running on port '+config.httpPort);
  });
  
  // Instantiate the HTTPS server
  var httpsServerOptions = {
    'key': fs.readFileSync('../https/key.pem'),
    'cert': fs.readFileSync('../https/cert.pem')
  };
  var httpsServer = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res);
  });
  
  // Start the HTTPS server
  httpsServer.listen(config.httpsPort,function(){
   console.log('The HTTPS server is running on port '+config.httpsPort);
  });

var unifiedServer = async function(req,res){

    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    var method = req.method.toLowerCase();
    var headers = req.headers;
    var queryStringObject = parsedUrl.query;

    var decoder = new StringDecoder('utf-8');
    var buffer = '';
   await req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end()})

    
    var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    var data = {
        'trimmedPath' : trimmedPath,
        'method' : method,
        'headers' : headers,
        'queryStringObject' : queryStringObject,
        'payload' : helpers.parseJsonToObject(buffer)
      };

    chosenHandler(data,function(status, payload){
        var payloadString = JSON.stringify(payload);
        res.writeHead(status);
        res.end(payloadString)

        console.log('The status is ', status, 'and here\'s a little Jason', payloadString)
    })
    
    
}


var router = {
    "hello": handlers.hello,
    "users": handlers.users,
    "tokens": handlers.tokens,
    "order": handlers.order
}

var pubKey = "pk_test_51IZrGUGdqWtcA2Kl8jltjUqKlx1hoBlEr3AMIUpcW4bfidD6VrEPps2ofLeV5JYzTuHKTfVJk0EBHt1yglaAE4LZ00fFiCu1Sp"
