var http = require('http');
var url = require('url');

var server = http.createServer(function(req,res){

    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    // var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    console.log(path);

    var chosenHandler = typeof (router[path]) !== 'undefined' ? router[path] : handlers.notFound;
    chosenHandler(function(status, payload){
        var payloadString = JSON.stringify(payload);
        res.writeHead(status);
        res.end(payloadString)

        console.log('The status is ', status, 'and here\'s a little Jason', payloadString )
    })
    
    
})

server.listen(3000,function(){
  console.log(`The server is listening on port 3000`);
})

var handlers = {};

handlers.hello = function(callback) {
    callback(201, {"Hello": "worm", "the_backend": "is_twerking"})
}

handlers.notFound = function(callback) {
    callback(404, {"This_is_the_end": "of_the_world"})
}

var router = {
    "hello": handlers.hello,
    "/hello": handlers.hello
}