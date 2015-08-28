var Q = require("q");
var config = require("../config");
var crypto = require('crypto');
var Datastore = require("nedb");
var db = require("./db");

module.exports = User;

function User(userdata){
	this.$ = userdata || {};

	var that = this;
	Object.defineProperty(this, "id", {
		get: function(){
			return that.$.id;
		},
		set: function(id){
			that.$.id = id;
		}
	});
	Object.defineProperty(this, "password", {
		get: function(){
			return that.$.password;
		}
	});
	Object.defineProperty(this, "email", {
		get: function(){
			return that.$.email;
		},
		set: function(email){
			that.$.email = email;
		}
	});
}
User.prototype.save = function(){
	var defer = Q.defer();
	var that = this;
	db.users.update({id: this.$.id}, this.$, {}, function(err){
		if(err) return defer.reject(err);
		defer.resolve(that);
	});
	return defer.promise;
}

User.prototype.checkPermission = function(permission){
	var defer = Q.defer();
	if(!config.security){
		return defer.resolve(true);
	}

	db.users.findOne({
		id : this.$.id,
		permissions : permission
	}, function(err, ok){
		if(err) return defer.reject(err);

		if(ok) return defer.resolve(true);

		if(config.security && config.security.defaultPermissions) {
			return defer.resolve(checkDefault());
		} else {
			return defer.resolve(false);
		}
	});

	return defer.promise;

	function checkDefault(){
		return config.security.defaultPermissions.some(function(elem){
			return elem == permission;
		});
	}
}
User.prototype.canRead = function(){
	return this.checkPermission(User.PERMISSION.READ);
}
User.prototype.canWrite = function(){
	return this.checkPermission(User.PERMISSION.WRITE);
}
User.prototype.serialize = function(){
	return this.$;
}
User.prototype.isLogin = function(){
	return !!this.$.id;
}
User.PERMISSION = {
	READ : "read",
	WRITE : "write",
	ADMIN : "admin",
};
User.findById = function(id){
	var defer = Q.defer();

	db.users.findOne({id: id}, function(err, userdata){
		if(err) return defer.reject(err);
		defer.resolve(new User(userdata));
	});
	return defer.promise;
}
User.bind = function(store) {
	return new User(store);
}
User.list = function(){
	var defer = Q.defer();

	db.users.find({}, function(err, users){
		if(err) return defer.reject(err);
		defer.resolve(users);
	});

	return defer.promise;
}
User.register = function(id, password, email){
	var defer = Q.defer();
	db.users.insert({
		id : id,
		password : hash(password),
		email : email,
		permissions : config.security.defaultPermissions || ["read"]
	}, function(err, user){
		if(err) return defer.reject(err);
		defer.resolve(new User(user));
	});
	return defer.promise;
}
User.authenticate = function(id, password){
	var defer = Q.defer();

	db.users.findOne({id : id, password: hash(password)}, function(err, user){
		if(err) return defer.reject(err);
		if(!user) return defer.reject(new Error("authentication fail!"));
		defer.resolve(new User(user));
	});

	return defer.promise;
}
User.delete = function(id){
	var defer = Q.defer();
	db.users.remove({id: id}, {}, function(err){
		if(err) return defer.reject(err);
		defer.resolve();
	});
	return defer.promise;
}

function hash(data){
	return crypto.createHash('sha512').update(data + config.security.salt).digest("base64");
}
