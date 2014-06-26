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

exports.checkReadPermission = function(req, res, next){
	if(!config.security) return next();
	
	if(!req.session.user) {
		if(config.security.anonymous.charAt(0) == "r"){
			return next();
		} else {
			return res.render("noAuth", {title : "Waring"});
		}
	}
	user.hasReadPermission(req.session.user.id, function(err, f){
		if(err) throw err;

		if(f) {
			return next();
		} else {
			return res.render("noAuth", {title : "Waring"});
		}
	});
}
exports.checkWritePermission = function(req, res, next){
	if(!config.security) return next();
	
	if(!req.session.user) {
		if(config.security.anonymous.charAt(1) == "w"){
			return next();
		} else {
			return res.render("noAuth", {title : "Waring"});
		}
	}
	user.hasWritePermission(req.session.user.id, function(err, f){
		if(err) throw err;

		if(f) {
			return next();
		} else {
			return res.render("noAuth", {title : "Waring"});
		}
	});
}

exports.checkAdminPermission = function(req, res, next){
	if(!config.security) return next();
	if(!req.session.user) {
		if(config.security.anonymous.charAt(2) == "x"){
			return next();
		} else {
			return res.render("noAuth", {title : "Waring"});
		}
	}
	user.hasAdminPermission(req.session.user.id, function(err, f){
		if(err) throw err;

		if(f) {
			return next();
		} else {
			return res.render("noAuth", {title : "Waring"});
		}
	});
}
