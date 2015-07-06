var user = require("../app/user");

exports.loginForm = function(req, res){
	res.render("login", {});
}
exports.login = function(req, res){
	var id = req.body.id;
	var password = req.body.password;

	req.user.authenticate(id, password, function(err){
		if(err) {
			req.flash('warn', 'Login Fail! Check your Id or Password');
		} else {
			req.flash("info", "Welcome " + req.body.id + "!");
		}
		res.redirect(decodeURIComponent(req.query.redirect));
	});
}
exports.logout = function(req, res){
	req.user.logout();
	req.flash('info', 'Logout successfully!');
	res.redirect(decodeURIComponent(req.query.redirect));
}
exports.signupForm = function(req, res){
	res.render("signup", {title : "signup"});
}
exports.signup = function(req, res){
	var id = req.body.id;
	var password = req.body.password;
	var confirm = req.body.confirm;
	var email = req.body.email;
	var redirect = req.query.redirect;

	if(id == "" || password  == "" || confirm == ""){
		req.flash("warn", "please fill sign up form.");
		res.redirect("!signup?redirect=" + redirect);
		return;
	}
	if(password != confirm){
		req.flash("warn", "password and password confirm are not matched.");
		res.redirect("!signup?redirect=" + redirect);
		return;
	}
	req.user.register(id, password, email, function(err){
		if(err){
			req.flash("warn", "already registered id. please try another one.");
			res.redirect("!signup?redirect=" + redirect);
			return;
		}
		req.flash("info", "Welcome " + id + "!");
		res.redirect(decodeURIComponent(redirect));
	});
}
exports.list = function(req, res) {
	user.list(function(err, users){
		res.render("userlist.html", {users : users});
	});
}
exports.delete = function(req, res) {
	var id = req.params.id;
	user.delete(id, function(err){
		if(err) {
			req.flash("warn", "cannot delete " +id);
		}
		req.flash("info", "Delete " + id);
		res.redirect("/!users");
	});
}

exports.PERMISSION = user.PERMISSION;

exports.middleware = function(req, res, next){
	req.user = res.locals.user = user.bind(req.session, "user");
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
