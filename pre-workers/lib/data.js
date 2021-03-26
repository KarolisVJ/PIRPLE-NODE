/*
library for storing and editing data*/

var fs = require('fs');
var path = require('path');
var helpers = require('./helpers')

// Container for the module

var lib = {};

//base directory of the data folder
lib.baseDir = path.join(__dirname, '../.data/')

lib.create = function(dir,file,data,callback){
    //open the file
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx', function(err,fileDescriptor){
        if(!err && fileDescriptor) {
            var stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor,stringData,function(err){
                if (!err) {
                    fs.close(fileDescriptor, function(err){
                        if(!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file')
                        }
                    })
                } else {
                    callback('Error writing to new file')
                }
            })
        } else {
            callback('Could not create new file, it may already exist')
        }
    })
}

//Read data from a file

lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err,data){
        if(!err && data) {
            var parsedData = helpers.parseJsonToObject(data);
            callback(false,parsedData)
        } else {
        callback(err,data)
        };
    })
}

//Update data inside a file
lib.update = function(dir,file,data,callback) {
    //open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err,fileDescriptor){
        if(!err && fileDescriptor) {
            var stringData = JSON.stringify(data);
            fs.truncate(fileDescriptor,function(err){
                if(!err){
                    fs.write(fileDescriptor,stringData,function(err){
                        if(!err) {
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false)
                                } else {
                                    callback('Error closing the file')
                                }
                            })
                        } else {
                            callback('Error writing to existing file')
                        }
                    })
                } else {
                    callback('Error truncating file')
                }
            })
        } else {
            callback('Could not open the file for updating')
        }
    })
}

//delete a file

lib.delete = function(dir,file,callback) {
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(!err){
            callback(false)
        } else {
            callback('Error deleting file')
        }
    })
}

module.exports = lib;