var config = require("../config");
var fs = require('fs');
var crypto = require('crypto');
var jellybin = require("jellybin");

var db = jellybin("users.json", { create : true });

exports.authenticate = function(id, password, callback){
	db.load(function(err, users){
		if(err) return callback(err);
		
		if(users[id] && users[id].password == hash(password)){
			var user = {
				id : id,
				email : users[id].email,
				group : users[id].group
			}
			callback(null, user);
		} else {
			callback();
		}
	});
}

exports.register = function(id, password, email, callback){
	db.load(function(err, users){
		if(err) return callback(err);
		
		if(users[id]){
			callback("exsit id");
		} else {
			users[id] = {
				password : hash(password),
				email : email
			}
			db.save(users, callback);
		}
	});
}
exports.list = function(callback){
	db.load(callback);
}
exports.setGroup = function(id, group, callback){
	db.load(function(err, users){
		if(err) return callback(err);
		//TODO group check
		users[id].group = group;
		db.save(users, callback);
	})
}

function hash(data){
	return crypto.createHash('sha512').update(data + config.security.salt).digest("base64");
}
