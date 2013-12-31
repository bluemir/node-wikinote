var config = require("./config.node.js");
var wikiApp = require("./wikiApp.node.js")
var Path = require("./path.node.js");
var user = require("./user.node.js");

exports.init = function(app){
	//app.get("!list", listAll);
	app.get("/", redirectToFront);
	app.get("/!logout", disableMenu, logout);
	app.get("/!signup", disableMenu, signupForm);
	app.post("/!login", disableMenu, login);
	app.post("/!signup", disableMenu, signup);

	app.get(/^\/!public\/.*$/, publicFile);
	app.get(/^.*\.[^.\/]+$/, user.checkPermission, staticFile);

	var getRouterFactory = new ParamRouterFactory(wikiApp.view);
	getRouterFactory.register("edit", wikiApp.edit);
	getRouterFactory.register("attach", wikiApp.attach);
	getRouterFactory.register("move", wikiApp.moveForm);
	getRouterFactory.register("presentation", wikiApp.presentation);
	getRouterFactory.register("find", wikiApp.find);
	getRouterFactory.register("delete", wikiApp.deleteForm);
	getRouterFactory.register("history", wikiApp.history);
	app.get(/^.*\/[^.\/]+$/, user.checkPermission, getRouterFactory.getRouter());

	var postRouterFactory = new ParamRouterFactory();
	postRouterFactory.register("edit", wikiApp.save);
	postRouterFactory.register("attach", wikiApp.upload);
	postRouterFactory.register("move", wikiApp.move);
	postRouterFactory.register("delete", wikiApp.deleteComfirm);
	app.post(/^.*\/[^.\/]+$/, user.checkPermission, postRouterFactory.getRouter());
}

exports.preModule = function(req, res, next){
	req.wikiPath = new Path(req.path);
	res.locals.path = req.wikiPath;
	res.locals.bread = req.wikiPath.toArray();
	res.locals.notename = req.wikiPath.name;
	res.locals.config = config;
	res.locals.session = req.session;
	res.locals.msg = req.flash('msg');
	res.locals.msg = { 
		info : req.flash("info"),
		warn : req.flash('warn')
	};
	next();
}

var saveDir = config.wikiDir;

function redirectToFront(req, res){
	if("find" in req.query){
		wikiApp.findAll(req, res);
	} else {
		res.redirect("/" + config.frontPage);
	}
}

function publicFile(req, res){
	res.sendfile(req.path.substring(2));
}
function staticFile(req, res){
	res.sendfile(saveDir + decodeURIComponent(req.path));
}
function login(req, res){
	var id = req.param("id");
	var password = req.param("password");
	if(user.login(id, password)){
		req.session.user = id;
	} else {
		req.flash('warn', 'Login Fail! Check your Id or Password');
	}
	res.redirect(decodeURIComponent(req.param("redirect")));
}
function logout(req, res){
	delete req.session.user;
	req.flash('info', 'Logout successfully!');
	res.redirect(decodeURIComponent(req.param("redirect")));
}
function signupForm(req, res){
	res.render("signup", {title : "signup"});
}
function signup(req, res){
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
	user.register(req.param("id"), req.param("password"), function(e){
		if(e){
			req.flash("warn", "already registered id. please try another one.");
			res.redirect("!signup?redirect=" + req.param("redirect"));
			return;
		}
		req.flash("info", "Welcome " + req.param("id") + "!");
		req.session.user = req.param("id");
		res.redirect(decodeURIComponent(req.param("redirect")));
	});
}

function disableMenu(req, res, next) {
	res.locals.disableMenu = true;
	next();
}

function ParamRouterFactory(defaultFunc){
	this.defaultFunc = defaultFunc;
	this.map = {};
}
ParamRouterFactory.prototype.register = function(key, func){
	this.map[key] = func;
}
ParamRouterFactory.prototype.getRouter = function(){
	var that = this;
	return function router(req, res){
		for(var key in that.map){
			if(key in req.query){
				return that.map[key](req, res);
			}
		}
		return that.defaultFunc && that.defaultFunc(req, res);
	}
}
