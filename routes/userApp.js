var config = require("../config");

var user = require("../app/user");

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
	user.register(req.param("id"), req.param("password"), req.param("email"), function(err, user){
		if(err){
			req.flash("warn", "already registered id. please try another one.");
			res.redirect("!signup?redirect=" + req.param("redirect"));
			return;
		}
		req.flash("info", "Welcome " + req.param("id") + "!");
		req.session.user = user;
		res.redirect(decodeURIComponent(req.param("redirect")));
	});
}

exports.PERMISSION = user.PERMISSION;
function hasPermission(_user, permission, callback){
	if(!config.security) return next();

	if(_user){
		user.hasPermission(_user.id, permission, function(err, user){
			if(err || !user){
				return callback(false);
			} else {
				return callback(true);
			}
		});
	} else if(checkDefault(permission)) {
		return callback(true);
	} else {
		return callback(false);
	}
}

exports.checkPermission = function(permission){
	return function checkPermission(req, res, next){
		hasPermission(req.session.user, permission, function(has){
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
		hasPermission(req.session.user, permission, function(has){
			if(has){
				next();
			} else {
				return res.status(401).json({msg : "unauthorized"});
			}
		});
	}
}

function checkDefault(permission){
	return config.security.defaultPermission.some(function(elem){
		return elem == permission;
	});
}
