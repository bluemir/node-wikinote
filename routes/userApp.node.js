var config = require("./config.node.js");

var user = require("./user.node.js");

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
			//TODO save user object
			req.session.user = id;
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

exports.checkPermission = function(req, res, next){
	if(!config.security){
		next();
		return;
	}

	var permission;
	if(config.security.admin == req.session.user){
		permission = config.security.permission.substr(0, 3);
	} else if(req.session.user){
		permission = config.security.permission.substr(3, 3);
	} else {
		permission = config.security.permission.substr(6, 3);
	}

	if(req.method.toUpperCase() == "GET" && permission.charAt(0) == "r") {
		next();
		return;
	} else if(req.method.toUpperCase() == "POST" && permission.charAt(1) == "w") {
		next();
		return;
	}

	res.render("noAuth", {title : "Waring"});
}