var config = require("../config");

var user = require("../app/user.js");
var group = require("../app/group.js")

exports.login = function(req, res){
	var id = req.param("id");
	var password = req.param("password");
	
	user.authenticate(id, password, function(err, user){
		if(err) {
			throw err;
		}
		if(!user) {
			req.flash('warn', 'Login Fail! Check your Id or Password');
		} else {
			req.session.user = user;
		}
		res.redirect(decodeURIComponent(req.param("redirect")));
	})
}
exports.logout = function(req, res){
	delete req.session.user;
	req.flash('info', 'Logout successfully!');
	res.redirect(decodeURIComponent(req.param("redirect")));
}
exports.signupForm = function(req, res){
	res.render("signup", {title : "signup"});
}
exports.signup = function(req, res){
	if(req.param("id") == "" || req.param("password") == "" || req.param("confirm") == ""){
		req.flash("warn", "please fill sign up form.");
		res.redirect("!signup?redirect=" + req.param("redirect"));
		return;
	}
	if(req.param("password") != req.param("confirm")){
		req.flash("warn", "password and password confirm are not matched.");
		res.redirect("!signup?redirect=" + req.param("redirect"));
		return;
	}
	user.register(req.param("id"), req.param("password"), req.param("email"), function(e){
		if(e){
			console.log(e)
			req.flash("warn", "already registered id. please try another one.");
			res.redirect("!signup?redirect=" + req.param("redirect"));
			return;
		}
		req.flash("info", "Welcome " + req.param("id") + "!");
		req.session.user = req.param("id");
		res.redirect(decodeURIComponent(req.param("redirect")));
	});
}
exports.list = function(req, res){
	user.list(function(err, users){
		group.list(function(err, groups){
			res.render("userlist", {title : "list", users : users, groups : groups});
		});
	});
}

exports.checkReadPermission = function(user_, callback){
	if(!config.security) return callback(null, true)

	if(user_){
		user.hasReadPermission(user_.id, callback);
	} else {
		if(config.security.anonymous.charAt(0) == "r"){
			return callback(null, true);
		} else {
			return callback(null, false);
		}
	}
}

exports.checkWritePermission = function(user_, callback){
	if(!config.security) return callback(null, true)

	if(user_){
		user.hasWritePermission(user_.id, callback);
	} else {
		if(config.security.anonymous.charAt(1) == "w"){
			return callback(null, true);
		} else {
			return callback(null, false);
		}
	}
}

exports.checkAdminPermission = function(user_, callback){
	if(!config.security) return callback(null, true)

	if(user_){
		user.hasAdminPermission(user_.id, callback);
	} else {
		if(config.security.anonymous.charAt(2) == "x"){
			return callback(null, true);
		} else {
			return callback(null, false);
		}
	}
}
