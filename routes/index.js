var path = require("path");
var WikiPath = require("./wikipath");
var user = require("./userApp");
var wikiApp = require("./wikiApp");
var wikiApi = require("./wikiApi");
var config = require("../config");
var ParamRouter = require("./paramRouter")

exports.init = function(app){
	//wikiApp.init(app);
	//wikiApi.init(app);
	app.get("/", redirectToFront);
	app.get("/!logout", disableMenu, user.logout);
	app.get("/!signup", disableMenu, user.signupForm);
	app.post("/!login", disableMenu, user.login);
	app.post("/!signup", disableMenu, user.signup);

	app.post("/!api/1/save", wikiApi.checkWritePermission, wikiApi.save);
}

exports.preModule = function(req, res, next){
	req.wikiPath = new WikiPath(req.path);
	res.locals.path = req.wikiPath;
	res.locals.bread = req.wikiPath.toArray();
	res.locals.notename = req.wikiPath.name;
	res.locals.config = config;
	res.locals.session = req.session;
	res.locals.msg = {
		info : req.flash("info"),
		warn : req.flash('warn')
	};
	res.locals.wikiname = config.wikiname;
	next();
}

var staticRegex = /^.*\.[^.\/]+$/;
exports.static = function(req, res, next){
	var filePath = path.join(config.wikiDir, decodeURIComponent(req.path));

	if(staticRegex.test(req.path)){
		res.sendfile(filePath);
	} else {
		next();
	}
}
var publicRegex = /^\/!public\/.*$/;
exports.public = function(req, res, next){
	if(publicRegex.test(req.path)){
		res.sendfile(req.path.substring(2));
	} else {
		next();
	}
}

exports.wikiView = function(req, res, next){
	user.checkPermission(user.PERMISSION.READ)(req, res, function(){
		wikiApp.view(req, res, next);
	});
}

var paramRouter = ParamRouter();
paramRouter.get("view", user.checkPermission(user.PERMISSION.READ), wikiApp.view);
paramRouter.get("edit", user.checkPermission(user.PERMISSION.WRITE), wikiApp.edit);
paramRouter.get("attach", user.checkPermission(user.PERMISSION.WRITE), wikiApp.attach);
paramRouter.get("move", user.checkPermission(user.PERMISSION.WRITE), wikiApp.moveForm);
paramRouter.get("presentation", user.checkPermission(user.PERMISSION.READ), wikiApp.presentation);
paramRouter.get("find", user.checkPermission(user.PERMISSION.READ), wikiApp.find);
paramRouter.get("delete", user.checkPermission(user.PERMISSION.WRITE), wikiApp.deleteForm);
paramRouter.get("history", user.checkPermission(user.PERMISSION.READ), wikiApp.history);

paramRouter.post("edit", user.checkPermission(user.PERMISSION.WRITE), wikiApp.save);
paramRouter.post("attach", user.checkPermission(user.PERMISSION.WRITE), wikiApp.upload);
paramRouter.post("move", user.checkPermission(user.PERMISSION.WRITE), wikiApp.move);
paramRouter.post("delete", user.checkPermission(user.PERMISSION.WRITE), wikiApp.deleteComfirm);

exports.paramRouter = paramRouter;

function redirectToFront(req, res){
	if("find" in req.query){
		wikiApp.find(req, res);
	} else {
		res.redirect("/" + config.frontPage);
	}
}

function disableMenu(req, res, next) {
	res.locals.disableMenu = true;
	next();
}
