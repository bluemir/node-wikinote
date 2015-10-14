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
User.prototype.addPermission = function(permission){
	if(this.$.permissions.some(function(e){
		return e == permission;
	})){
		return this;
	}
	this.$.permissions.push(permission);
	return this;
}
User.prototype.deletePermission = function(permission){
	this.$.permissions = this.$.permissions.filter(function(elem){
		return elem != permission;
	});
	return this;
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
		defer.resolve(true);
		return defer.promise;
	}
	if(permission === undefined){
		defer.reject(new Error("permission cannot be undefined"));
		return defer.promise;
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
User.prototype.isAdmin = function(){
	return this.checkPermission(User.PERMISSION.ADMIN);
}
User.prototype.serialize = function(){
	return this.toJSON();
}
User.prototype.toJSON = function(){
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

	if(id === undefined){
		defer.reject(new Error("id cannot be undefined"));
	}

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
User.addPermission = function(id, permission){
	var defer = Q.defer();
	db.users.update({id:id}, {$addToSet: {permissions: permission}}, {}, function(err){
		if(err) return defer.reject(err);
		defer.resolve();
	});
	return defer.promise;
}
User.deletePermission = function(id, permission){
	var defer = Q.defer();
	db.users.update({id:id}, {$pull : {permissions: permission}}, {}, function(err){
		if(err) return defer.reject(err);
		defer.resolve();
	});
	return defer.promise;
}

function hash(data){
	return crypto.createHash('sha512').update(data + config.security.salt).digest("base64");
}
