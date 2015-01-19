var config = require("../config");

var user = require("../app/user");

exports.login = function(req, res){
	var id = req.param("id");
	var password = req.param("password");

	req.user.authenticate(id, password, function(err){
		if(err) {
			req.flash('warn', 'Login Fail! Check your Id or Password');
		} else {
			req.flash("info", "Welcome " + req.param("id") + "!");
		}
		res.redirect(decodeURIComponent(req.param("redirect")));
	});
}
exports.logout = function(req, res){
	req.user.logout();
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
	req.user.register(req.param("id"), req.param("password"), req.param("email"), function(err){
		if(err){
			req.flash("warn", "already registered id. please try another one.");
			res.redirect("!signup?redirect=" + req.param("redirect"));
			return;
		}
		req.flash("info", "Welcome " + req.param("id") + "!");
		res.redirect(decodeURIComponent(req.param("redirect")));
	});
}


exports.PERMISSION = user.PERMISSION;

exports.middleware = function(req, res, next){
	if(!req.session.user){
		req.session.user = {};
	}
	req.user = user.bind(req.session.user, function(value){
		req.session.user = value;
	});
	res.locals.user = req.user;
	next();
}
exports.checkPermission = function(permission){
	return function checkPermission(req, res, next){
		req.user.hasPermission(permission, function(err, has){
			if(err) {
				throw err;
			}
			if(has){
				next();
			} else {
				return res.status(401).render("noAuth", {title : "Waring"});
			}
		});
	}
}

exports.checkApiPermission = function(permission){
	return function checkPermission(req, res, next){
		req.user.hasPermission(permission, function(err, has){
			if(err){
				throw err;
			}
			if(has){
				next();
			} else {
				return res.status(401).json({msg : "unauthorized"});
			}
		});
	}
}
