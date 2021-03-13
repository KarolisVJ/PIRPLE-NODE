var _data = require('./data')
var helpers = require('./helpers')

// define handlers
var handlers = {};


handlers.ping = function(data, callback) {
  callback(200);
}


// Not found handler
handlers.notFound = function(data,callback){
  callback(404); 
}

handlers.pSimtai = function(data, callback) {
  callback(500,{hujame: 'another handler'})
}

handlers.users = function(data,callback) {
    var acceptableMethods = ['post','get', 'put', 'delete']
 
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data,callback)
    } else {
        callback(405)
    }

}

handlers._users = {};

// required data: fname, lname, phone, password, tosAgreement
handlers._users.post = function(data,callback) {
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    console.log(data)

    if(firstName && lastName && phone && password && tosAgreement) {
        //Make sure that the user doesnt already exist
        _data.read('users',phone,function(err, data){
            if(err){
                var hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };
    
                    //store the user
                    _data.create('users',phone,userObject,function(err){
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err);
                            callback(500,{'Error': 'Could not create the new user'})
                        }
                    })
                } else {
                    callback(500,{'Error': 'Could not has the user\'s password'})
                }
                
                
            } else {
                callback(400,{'Error': 'A user with that phone number already exists'})
            }
        })
    } else {
        callback(400,{'Error': 'Missing required fields'})
    }
}

//only let a authenticated user access their object

handlers._users.get = function(data,callback) {
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    console.log(phone)
    if(phone){
        _data.read('users',phone,function(err,data){
            if(!err && data) {
                //remove the hashed password from the user object
                delete data.hashedPassword;
                callback(200,data);
            } else {
                callback(404)
            }
        })
    } else {
        callback(400,{'Error': 'Missing required field'})
    }
}

handlers._users.put = function(data,callback) {}

handlers._users.delete = function(data,callback) {}

module.exports = handlers;