var config = require("../config");
var fs = require('fs');
var crypto = require('crypto');
var Datastore = require("nedb");

var db = {
	users : new Datastore({filename : "user.nedb", autoload : true})
};

db.users.ensureIndex({fieldName : "id", unique : true});

exports.authenticate = function(id, password, callback){
	db.users.findOne({id : id}, function(err, user){
		if(err) return callback(err);
		console.log(user.password , "\n", hash(password));	
		if(user.password == hash(password)){
			callback(null, user);
		} else {
			callback();
		}
	});
}

exports.register = function(id, password, email, callback){
	db.users.findOne({id : id}, function(err, user){
		if(err) return callback(err);
		if(user) return callback("exsit id");
		db.users.insert({
			id : id, 
			password : hash(password), 
			email : email,
			permission : ["read"]
		}, function(err, data){
			callback(null, data);
		});
	});
}

exports.PERMISSION = {
	READ : "read",
	WRITE : "write",
	ADMIN : "admin",
};

exports.hasPermission = function(id, permission, callback){
	db.users.findOne({
		id : id,
		permission : permission
	}, callback);
}

function hash(data){
	return crypto.createHash('sha512').update(data + config.security.salt).digest("base64");
}
