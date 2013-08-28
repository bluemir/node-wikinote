var config = require("./config.node.js");
var wikiApp = require("./wikiApp.node.js")
var Path = require("./path.node.js");
var user = require("./user.node.js");

exports.init = function(app){
	//app.get("!list", listAll);
	app.get("/", redirectToFront);
	app.get("/!logout", logout);
	app.get(/^\/!public\/.*$/, publicFile);
	app.get(/^.*\.[^.\/]+$/, user.checkPermission, staticFile);

	var getRouterFactory = new ParamRouterFactory(wikiApp.view);
	getRouterFactory.register("edit", wikiApp.edit);
	getRouterFactory.register("attach", wikiApp.attach);
	getRouterFactory.register("move", wikiApp.moveForm);
	getRouterFactory.register("presentation", wikiApp.presentation);
	getRouterFactory.register("find", wikiApp.find);
	app.get(/^.*\/[^.\/]+$/, user.checkPermission, getRouterFactory.getRouter());

	app.post(/^\/!login$/, login);

	var postRouterFactory = new ParamRouterFactory();
	postRouterFactory.register("edit", wikiApp.save);
	postRouterFactory.register("attach", wikiApp.upload);
	postRouterFactory.register("move", wikiApp.move);
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
	next();
}

var saveDir = config.wikiDir;

function redirectToFront(req, res){
	if("find" in req.query){
		wikiApp.find(req, res);
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
		req.flash('msg', 'Login Fail! Check your Id or Password');
	}
	res.redirect(decodeURIComponent(req.param("redirect")));
}
function logout(req, res){
	delete req.session.user;
	//TODO must have message level
	req.flash('msg', 'Logout successfully!');
	res.redirect(decodeURIComponent(req.param("redirect")));
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
		console.log(that.defaultFunc);
		return that.defaultFunc && that.defaultFunc(req, res);
	}
}
