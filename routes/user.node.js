var config = ("./config.node.js");
var fs = require('fs');
var crypto = require('crypto');
var shasum = crypto.createHash('sha512');


exports.login = function(id, password){
	var users = require("users.json");
	return users[id] == getHash(password);
}
exports.register = function(id, password, callback) {
	var users = require("users.json");
	users[id] = getHash(password);
	fs.writeFile("users.json", JSON.stringify(users, null, 4), {encode : "utf8"}, callback);
}
function getHash(str){
	shasum.update(str + config.salt);
	return shasum.digest("base64");
}
