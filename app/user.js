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
		if(user && user.password == hash(password)){
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
			permission : config.security.defaultPermission || ["read"]
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
	}, function(err, ok){
		if(err) return callback(err);

		if(ok) return callback(null, true);

		if(config.security && config.security.defaultPermission) {
			return callback(null, checkDefault());
		} else {
			return callback(null, false);
		}

		function checkDefault(){
			return config.security.defaultPermission.some(function(elem){
				return elem == permission;
			});
		}
	});
}

function hash(data){
	return crypto.createHash('sha512').update(data + config.security.salt).digest("base64");
}

