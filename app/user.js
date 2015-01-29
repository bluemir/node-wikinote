var config = require("../config");
var fs = require('fs');
var crypto = require('crypto');
var Datastore = require("nedb");

var db = {
	users : new Datastore({filename : "user.nedb", autoload : true})
};

db.users.ensureIndex({fieldName : "id", unique : true});

exports.PERMISSION = {
	READ : "read",
	WRITE : "write",
	ADMIN : "admin",
};

var User = {};

User.authenticate = function(id, password, callback){
	var that = this;
	db.users.findOne({id : id, password: hash(password)}, function(err, user){
		if(err) return callback(err);
		if(!user) return callback(new Error("authentication fail!"));

		that.store = user;

		callback();
	});
}
User.logout = function(){
	this.store = {};
}
User.register = function(id, password, email, callback){
	var that = this;
	db.users.insert({
		id : id,
		password : hash(password),
		email : email,
		permission : config.security.defaultPermission || ["read"]
	}, function(err, data){
		if(err) return callback(err);

		that.store = data;
		callback(null, data);
	});
}
User.hasPermission = function(permission, callback){
	db.users.findOne({
		id : this.id,
		permission : permission
	}, function(err, ok){
		if(err) return callback(err);

		if(ok) return callback(null, true);

		if(config.security && config.security.defaultPermission) {
			return callback(null, checkDefault());
		} else {
			return callback(null, false);
		}
	});

	function checkDefault(){
		return config.security.defaultPermission.some(function(elem){
			return elem == permission;
		});
	}
}
User.canRead = function(callback){
	this.hasPermission("read", callback);
}
User.canWrite = function(){
	this.hasPermission("write", callback);
}
User.isLogin = function(){
	return !!this.store.id;
}

exports.bind = function(session, key){
	session[key] = session[key] || {};
	return Object.create(User, {
		store : {
			set : function(value){
				session[key] = value;
			},
			get : function() {
				return session[key];
			}
		},
		id : {
			get : function(){
				return session[key].id;
			}
		},
		email : {
			get : function(){
				return session[key].email;
			}
		}
	});
}

function hash(data){
	return crypto.createHash('sha512').update(data + config.security.salt).digest("base64");
}
