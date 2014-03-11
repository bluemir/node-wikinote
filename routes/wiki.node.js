var config = require("./config.node.js");
var wikiApp = require("./wikiApp.node.js")
var Path = require("./path.node.js");
var user = require("./userApp.node.js");

exports.init = function(app){
	app.get("/", redirectToFront);
	app.get("/!logout", disableMenu, user.logout);
	app.get("/!signup", disableMenu, user.signupForm);
	app.get("/!user",disableMenu, user.checkAdminPermission, user.list)
	app.post("/!login", disableMenu, user.login);
	app.post("/!signup", disableMenu, user.signup);

	app.get(/^\/!public\/.*$/, publicFile);
	app.get(/^.*\.[^.\/]+$/, user.checkReadPermission, staticFile);

	var getRouterFactory = new ParamRouterFactory(wikiApp.view);
	getRouterFactory.register("edit", wikiApp.edit);
	getRouterFactory.register("attach", wikiApp.attach);
	getRouterFactory.register("move", wikiApp.moveForm);
	getRouterFactory.register("presentation", wikiApp.presentation);
	getRouterFactory.register("find", wikiApp.find);
	getRouterFactory.register("delete", wikiApp.deleteForm);
	getRouterFactory.register("history", wikiApp.history);
	app.get(/^.*\/[^.\/]+$/, user.checkReadPermission, getRouterFactory.getRouter());

	var postRouterFactory = new ParamRouterFactory();
	postRouterFactory.register("edit", wikiApp.save);
	postRouterFactory.register("attach", wikiApp.upload);
	postRouterFactory.register("move", wikiApp.move);
	postRouterFactory.register("delete", wikiApp.deleteComfirm);
	app.post(/^.*\/[^.\/]+$/, user.checkWritePermission, postRouterFactory.getRouter());
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
	res.locals.wikiname = config.wikiname;
	next();
}

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
	res.sendfile(config.wikiDir + decodeURIComponent(req.path));
}

function disableMenu(req, res, next) {
	res.locals.disableMenu = true;
	next();
}
function checkAdmin(req, res, next) {
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
