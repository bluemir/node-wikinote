var User = require("../app/user");

exports.loginForm = function(req, res){
	res.render("login", {});
}
exports.login = function(req, res){
	var id = req.body.id;
	var password = req.body.password;

	User.authenticate(id, password).then(function(user){
		req.user = user;
		req.flash("info", "Welcome " + req.body.id + "!");
		res.redirect(decodeURIComponent(req.query.redirect));
	}).fail(function(err){
		req.flash('warn', 'Login Fail! Check your Id or Password');
		res.redirect(decodeURIComponent(req.query.redirect));
	});
}
exports.logout = function(req, res){
	req.user = new User();
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
	User.register(id, password, email).then(function(user){
		req.user = user;
		req.flash("info", "Welcome " + id + "!");
		res.redirect(decodeURIComponent(redirect));
	}).fail(function(err){
		req.flash("warn", "already registered id. please try another one.");
		res.redirect("!signup?redirect=" + redirect);
	});
}
exports.list = function(req, res) {
	User.list().then(function(users){
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

exports.PERMISSION = User.PERMISSION;

exports.middleware = function(req, res, next){
	var user;
	Object.defineProperty(req, "user", {
		get: function(){
			return user;
		},
		set: function(newUser){
			user = newUser;
			res.locals.user = newUser;
			req.session.user = newUser.serialize();
		}
	});
	req.user = User.bind(req.session.user);
	next();
}
exports.checkPermission = function(permission){
	return function checkPermission(req, res, next){
		req.user.checkPermission(permission).then(function(has){
			if(has){
				next();
			} else {
				res.status(401).render("noAuth", {title : "Waring"});
			}
		}).fail(function(err){
			next(err);
		});
	}
}

exports.checkApiPermission = function(permission){
	return function checkPermission(req, res, next){
		req.user.checkPermission(permission).then(function(has){
			if(has){
				next();
			} else {
				return res.status(401).json({msg : "unauthorized"});
			}
		}).fail(function(err){
			return next(err);
		});
	}
}
