var config = require("./config.node.js");
var fs = require('fs');
var crypto = require('crypto');


exports.login = function(id, password){
	var users = require("../users.json");
	console.log(getHash(password));
	return users[id] == getHash(password);
}
exports.register = function(id, password, callback) {
	var users = require("../users.json");
	users[id] = getHash(password);
	fs.writeFile("../users.json", JSON.stringify(users, null, 4), {encode : "utf8"}, callback);
}
function getHash(str){
	var shasum = crypto.createHash('sha512');
	shasum.update(str + config.salt);
	return shasum.digest("base64");
}
exports.requireLogin = function(req, res, next){
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
	} else if(req.method.toUpperCase() == "POST" && permission.charAt(0) == "w") {
		next();
		return;
	}

	res.render("noAuth", {title : "Waring"});
}
