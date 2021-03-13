/*
 * Primary file for API
  */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
const {StringDecoder} = require('string_decoder');
var config = require('./lib/config')
var fs = require('fs');
var _data = require('./lib/data')
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');



 // Instantiate the http server
var httpServer = http.createServer(function(req,res){


unifiedServer(req,res)
 
});

// Start the http server
httpServer.listen(config.httpPort,function(){
  console.log(`The server is listening on port ${config.httpPort}`);
});

// instantiate the https server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}
var httpsServer = https.createServer(httpsServerOptions,function(req,res){

  unifiedServer(req,res)
});

// start the https server
httpsServer.listen(config.httpsPort,function(){
  console.log(`The server is listening on port ${config.httpsPort}`);
});

// All the server logic for both the http and https createServer
var unifiedServer = function(req,res) {

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload if any
  var decoder = new StringDecoder('utf8');
  var buffer = '';

  req.on('data', function(data){
    buffer += decoder.write(data);
    console.log('First buffer', buffer)
   });
 
   req.on('end', function(data){
     buffer += decoder.end(data);
     console.log('Second buffer', buffer)
   })





// choose the handler this request should go to
  var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

//construct the data object to send to the handlers

let data = {
  'trimmedPath': trimmedPath,
  'queryStringObject': queryStringObject,
  'method': method,
  'headers': headers,
  'payload': helpers.parseJsonToObject(buffer)
}
// route the request to the handler specified in the router 
chosenHandler(data, function(statusCode, payload){
   //use the status code called back by the handler to
   statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
   //use the payload called back by the handler
   payload = typeof(payload) == 'object' ? payload : {};
   var payloadString = JSON.stringify(payload);

  // Send the response
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(statusCode);
  res.end(payloadString);
  // Log the request/response
  console.log('Returning this response: ', statusCode,payloadString);
})  




}



var router = {
  "about": handlers.sample,
  "lol": handlers.pSimtai,
  "ping": handlers.ping,
  "users": handlers.users,
}
