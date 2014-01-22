var config = require("./config.node.js");
var fs = require('fs');
var crypto = require('crypto');

exports.checkPermission = function(req, res, next){
	if(!config.security){
		next();
		return;
	}

	var permission;
	if(config.security.admin == req.session.user){
		permission = config.security.permission.substr(0, 3);
	} else if(req.session.user){
		permission = config.security.permission.substr(3, 3);
	} else {
		permission = config.security.permission.substr(6, 3);
	}

	if(req.method.toUpperCase() == "GET" && permission.charAt(0) == "r") {
		next();
		return;
	} else if(req.method.toUpperCase() == "POST" && permission.charAt(1) == "w") {
		next();
		return;
	}

	res.render("noAuth", {title : "Waring"});
}
/*
{
	password : "",
	email ; ""
}
*/
exports.authenticate = function(id, password, callback){
	load(function(err, users){
		if(err) return callback(err);
		
		if(users[id].password == hash(password)){
			var user = {
				id : id,
				email : users[id].email
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
		
		console.log(users);
		
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
	return crypto.createHash('sha512').update(data + config.salt).digest("base64");
}
