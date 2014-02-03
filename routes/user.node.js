var config = require("./config.node.js");
var fs = require('fs');
var crypto = require('crypto');

exports.authenticate = function(id, password, callback){
	load(function(err, users){
		if(err) return callback(err);
		
		if(users[id].password == hash(password)){
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
	load(function(err, users){
		if(err) return callback(err);
		
		if(users[id]){
			callback("exsit id");
		} else {
			users[id] = {
				password : hash(password),
				email : email
			}
			save(users, callback);
		}
	});
}
exports.list = function(callback){
	load(callback);
}

function load(callback){
	try {
		var users = require("../users.json");
		callback(null, users);
	} catch(e){
		callback(e)
	}
}
function save(users, callback){
	fs.writeFile("./users.json", JSON.stringify(users, null, 4), {encode : "utf8"}, callback);
}
function hash(data){
	return crypto.createHash('sha512').update(data + config.security.salt).digest("base64");
}
