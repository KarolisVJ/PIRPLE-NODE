var _data = require('./data')
var helpers = require('./helpers')
var config = require('./config')
const stripe = require('./stripe')

var handlers = {};
var menu = [{name: "Margarita", price: 5.99}, {name: "Capricciosa", price: 7.99}, {name: "Pepperoni", price: 8.99}, {name: "Scones", price: 3.99}, {name: "Calzone", price: 8.99}, {name:"Chicago", price: 10.99}, {name: "Beverage", price: 1.99}]


handlers.hello = function(callback) {
    callback(201, {"Hello": "worm", "the_backend": "is_twerking"})
}

handlers.notFound = function(callback) {
    callback(404, {"This_is_the_end": "of_the_world"})
}

handlers.users = function(data,callback) {
    var acceptableMethods = ['post','get', 'put', 'delete']
 
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data,callback)
    } else {
        callback(405)
    }

}
handlers._order = {};

handlers.order = function(data,callback) {
    var acceptableMethods = ['post','get', 'put', 'delete']
 
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._order[data.method](data,callback)
    } else {
        callback(405)
    }

}

handlers._users = {};


handlers._users.post = function(data,callback) {
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    var address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
    console.log('This data', data)

    if(firstName && lastName &&  password && email && address) {
        //Make sure that the user doesnt already exist
        _data.read('users',email,function(err, data){
            if(err){
                var hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'email': email,
                        'hashedPassword': hashedPassword,
                        'address': address
                    };
    
                    //store the user
                    _data.create('users',email,userObject,function(err){
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
                callback(400,{'Error': 'A user with that email already exists'})
            }
        })
    } else {
        callback(400,{'Error': 'Missing required fields'})
    }
}

handlers._users.get = function(data,callback) {
    var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

    if(email){

          // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email number
    handlers._tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user
        _data.read('users',email,function(err,data){
          if(!err && data){
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword;
  
            callback(200,menu);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
}


handlers._users.put = function(data,callback){
    // Check for required field
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  
    // Check for optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  
    // Error if email is invalid
    if(email){
      // Error if nothing is sent to update
      if(firstName || lastName || password){
  
        // Get token from headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  
        // Verify that the given token is valid for the email number
        handlers._tokens.verifyToken(token,email,function(tokenIsValid){
          if(tokenIsValid){
  
            // Lookup the user
            _data.read('users',email,function(err,userData){
              if(!err && userData){
                // Update the fields if necessary
                if(firstName){
                  userData.firstName = firstName;
                }
                if(lastName){
                  userData.lastName = lastName;
                }
                if(password){
                  userData.hashedPassword = helpers.hash(password);
                }
                // Store the new updates
                _data.update('users',email,userData,function(err){
                  if(!err){
                    callback(200);
                  } else {
                    callback(500,{'Error' : 'Could not update the user.'});
                  }
                });
              } else {
                callback(400,{'Error' : 'Specified user does not exist.'});
              }
            });
          } else {
            callback(403,{"Error" : "Missing required token in header, or token is invalid."});
          }
        });
      } else {
        callback(400,{'Error' : 'Missing fields to update.'});
      }
    } else {
      callback(400,{'Error' : 'Missing required field.'});
    }
  
};

// Required data: email
// Cleanup old checks associated with the user
handlers._users.delete = function(data,callback){
    // Check that email number is valid
    var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
    if(email){
  
      // Get token from headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  
      // Verify that the given token is valid for the email number
      handlers._tokens.verifyToken(token,email,function(tokenIsValid){
        if(tokenIsValid){
          // Lookup the user
          _data.read('users',email,function(err,userData){
            if(!err && userData){
              // Delete the user's data
              _data.delete('users',email,function(err){
                if(!err){
                  // Delete each of the checks associated with the user
                  var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                  var checksToDelete = userChecks.length;
                  if(checksToDelete > 0){
                    var checksDeleted = 0;
                    var deletionErrors = false;
                    // Loop through the checks
                    userChecks.forEach(function(checkId){
                      // Delete the check
                      _data.delete('checks',checkId,function(err){
                        if(err){
                          deletionErrors = true;
                        }
                        checksDeleted++;
                        if(checksDeleted == checksToDelete){
                          if(!deletionErrors){
                            callback(200);
                          } else {
                            callback(500,{'Error' : "Errors encountered while attempting to delete all of the user's checks. All checks may not have been deleted from the system successfully."})
                          }
                        }
                      });
                    });
                  } else {
                    callback(200);
                  }
                } else {
                  callback(500,{'Error' : 'Could not delete the specified user'});
                }
              });
            } else {
              callback(400,{'Error' : 'Could not find the specified user.'});
            }
          });
        } else {
          callback(403,{"Error" : "Missing required token in header, or token is invalid."});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing required field'})
    }
};



handlers.tokens = function(data,callback) {
    var acceptableMethods = ['post','get', 'put', 'delete']
    
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._tokens[data.method](data,callback)
        } else {
            callback(405)
        }
    }


handlers._tokens = {}


handlers._tokens.verifyToken = function(id,email,callback){
    // Lookup the token
    _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
        // Check that the token is for the given user and has not expired
        if(tokenData.email == email && tokenData.expires > Date.now()){
            callback(true);
        } else {
            callback(false);
        }
        } else {
        callback(false);
        }
    });
    };

handlers._tokens.post = function(data,callback){
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(email && password){
      // Lookup the user who matches that email number
      _data.read('users',email,function(err,userData){
        if(!err && userData){
          // Hash the sent password, and compare it to the password stored in the user object
          var hashedPassword = helpers.hash(password);
          if(hashedPassword == userData.hashedPassword){
            // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
            var tokenId = helpers.createRandomString(20);
            var expires = Date.now() + 1000 * 60 * 60;
            var tokenObject = {
              'email' : email,
              'id' : tokenId,
              'expires' : expires
            };
  
            // Store the token
            _data.create('tokens',tokenId,tokenObject,function(err){
              if(!err){
                callback(200,tokenObject);
              } else {
                callback(500,{'Error' : 'Could not create the new token'});
              }
            });
          } else {
            callback(400,{'Error' : 'Password did not match the specified user\'s stored password'});
          }
        } else {
          callback(400,{'Error' : 'Could not find the specified user.'});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing required field(s).'})
    }
  };

  handlers._tokens.delete = function(data,callback){
    // Check that id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){
      // Lookup the token
      _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
          // Delete the token
          _data.delete('tokens',id,function(err){
            if(!err){
              callback(200);
            } else {
              callback(500,{'Error' : 'Could not delete the specified token'});
            }
          });
        } else {
          callback(400,{'Error' : 'Could not find the specified token.'});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing required field'})
    }
};

handlers._order.post = function(data,callback) {
    var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
    if(email){
  
      // Get token from headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  
      // Verify that the given token is valid for the email number
      handlers._tokens.verifyToken(token,email,function(tokenIsValid){
        if(tokenIsValid){
            if (data.payload.order.length > 0){
            var totalPrice = 0;
            var shoppingCart = [];
            for (i=0; i < data.payload.order.length; i++) {
                totalPrice += menu[i].price;
                shoppingCart.push(menu[i])
            }
            stripe.performPayment(totalPrice, token, function(err, stripeData) {
                if (!err && stripeData.paid) {
                  const orderData = {
                    // id : orderId,
                    // shoppingCartId: shoppingCardId,
                    status : 'paid',
                    stripeId: stripeData.id
                  }
                  callback(200,{"Your order data": orderData, "The total price is":totalPrice})}
            
                })
            
            } else {
                callback(400, {"Empty":"order"})
            }
        } else {
            callback(403, {"Invalid": "token"})
        }
      })
    }
}

module.exports = handlers;