var Error = require("../app/error");
var User = require("../app/user");
var Q = require("q");

exports.loginForm = function(req, res){
	res.render("login", {});
}
exports.login = function(req, res){
	var id = req.body.id;
	var password = req.body.password;

	User.authenticate(id, password).then(function(user){
		req.user = user;
		req.flash("info", "Welcome " + req.body.id + "!");
		res.redirect(303, decodeURIComponent(req.query.redirect));
	}).fail(function(err){
		req.flash('warn', 'Login Fail! Check your Id or Password');
		res.redirect(303, decodeURIComponent(req.query.redirect));
	});
}
exports.logout = function(req, res){
	req.user = new User();
	req.flash('info', 'Logout successfully!');
	res.redirect(303, decodeURIComponent(req.query.redirect));
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
		res.redirect(303, "!signup?redirect=" + redirect);
		return;
	}
	if(password != confirm){
		req.flash("warn", "password and password confirm are not matched.");
		res.redirect(303, "!signup?redirect=" + redirect);
		return;
	}
	User.register(id, password, email).then(function(user){
		req.user = user;
		req.flash("info", "Welcome " + id + "!");
		res.redirect(303, decodeURIComponent(redirect));
	}).fail(function(err){
		req.flash("warn", "already registered id. please try another one.");
		res.redirect(303, "!signup?redirect=" + redirect);
	});
}
exports.list = function(req, res) {
	User.list().then(function(users){
		res.render("userlist.html", {users : users});
	});
}
exports.profile = function(req, res){
	var userId = req.params.userId;

	Q.fcall(function(){
		if(req.user.id === userId){
			return true;
		} else {
			return req.user.isAdmin();
		}
	}).then(function(ok){
		if (ok){
			return User.findById(userId);
		} else {
			throw new Error.Unauthorized();
		}
	}).then(function(user){
		res.render("profile.html", {me : user});
	}).fail(function(err){
		Error.handle(err).httpResponse(res);
	});
}
exports.saveProfile = function(req, res){
	var userId = req.params.userId;
	Q.fcall(function(){
		if(req.user.id === userId) {
			return true;
		} else {
			return req.user.isAdmin();
		}
	}).then(function(ok){
		if(ok) {
			return User.findById(userId)
		} else {
			throw new Error.Unauthorized();
		}
	}).then(function(user){
		user.email = req.body.email;
		var password = req.body.password;
		var confirm = req.body.password;
		if(password != "" && password == confirm){
			user.setPassword(password);
		}
		return user.save();
	}).then(function(){
		res.redirect(303, "/!users/"+userId);
	}).fail(function(err){
		Error.handle(err).httpResponse(res);
	});
}

exports.deleteUser = function(req, res){
	var id = req.params.userId;
	User.delete(id).then(function(err){
		res.jsonp({msg:ok});
	}).fail(function(err){
		res.jsonp(err);
	});
}
exports.addPermission = function(req, res){
	var id = req.params.userId;
	var permission = req.params.permission;

	User.findById(id).then(function(user){
		return user.addPermission(permission).save();
	}).then(function(user){
		res.jsonp(user);
	}).fail(function(err){
		res.status(500).jsonp(err);
	});
}
exports.deletePermission = function(req, res){
	var id = req.params.userId;
	var permission = req.params.permission;

	User.findById(id).then(function(user){
		return user.deletePermission(permission).save();
	}).then(function(user){
		res.jsonp(user);
	}).fail(function(err){
		Error.handle(err).jsonResponse(res);
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
				(new Error.Unauthorized()).httpResponse(res);
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
				(new Error.Unauthorized()).jsonResponse(res);
			}
		}).fail(function(err){
			return next(err);
		});
	}
}

