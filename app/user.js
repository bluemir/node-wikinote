var config = require("../config");
var fs = require('fs');
var crypto = require('crypto');
var jellybin = require("jellybin");

var group = require("./group");

var db = jellybin("users.json", { create : true });

exports.authenticate = function(id, password, callback){
	db.load(function(err, users){
		if(err) return callback(err);
		
		if(users[id] && users[id].password == hash(password)){
			var user = {
				id : id,
				email : users[id].email,
				groups : users[id].groups
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
exports.hasReadPermission = function(id, callback){
	var user = db.json[id];
	if(!user) return callback(new Error("not Exist user"));
	

	callback(null, user.groups.some(function(element, index){
		return group.checkPermission(element, "r--");
	}));
}
exports.hasWritePermission = function(id, callback){
	var user = db.json[id];
	if(!user) return callback(new Error("not Exist user"));

	callback(null, user.groups.some(function(element, index){
		return group.checkPermission(element, "-w-");
	}));
}
exports.hasAdminPermission = function(id, callback){
	var user = db.json[id];
	if(!user) return callback(new Error("not Exist user"));

	callback(null, user.groups.some(function(element, index){
		return group.checkPermission(element, "---");
	}));
}
exports.setGroup = function(id, group, callback){
	db.load(function(err, users){
		if(err) return callback(err);
		//TODO group check
		users[id].groups.push(group);
		db.save(users, callback);
	});
}

function hash(data){
	return crypto.createHash('sha512').update(data + config.security.salt).digest("base64");
}
