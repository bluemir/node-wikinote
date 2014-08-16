var path = require("path");
var WikiPath = require("./wikipath");
var user = require("./userApp");
var wikiApp = require("./wikiApp");
var wikiApi = require("./wikiApi");
var config = require("../config");
var ParamRouter = require("./paramRouter")

var appRouter = ParamRouter();
appRouter.get("view", user.checkPermission(user.PERMISSION.READ), wikiApp.view);
appRouter.get("edit", user.checkPermission(user.PERMISSION.WRITE), wikiApp.edit);
appRouter.get("attach", user.checkPermission(user.PERMISSION.WRITE), wikiApp.attach);
appRouter.get("move", user.checkPermission(user.PERMISSION.WRITE), wikiApp.moveForm);
appRouter.get("presentation", user.checkPermission(user.PERMISSION.READ), wikiApp.presentation);
appRouter.get("find", user.checkPermission(user.PERMISSION.READ), wikiApp.find);
appRouter.get("delete", user.checkPermission(user.PERMISSION.WRITE), wikiApp.deleteForm);
appRouter.get("history", user.checkPermission(user.PERMISSION.READ), wikiApp.history);

appRouter.post("edit", user.checkPermission(user.PERMISSION.WRITE), wikiApp.save);
appRouter.post("attach", user.checkPermission(user.PERMISSION.WRITE), wikiApp.upload);
appRouter.post("move", user.checkPermission(user.PERMISSION.WRITE), wikiApp.move);
appRouter.post("delete", user.checkPermission(user.PERMISSION.WRITE), wikiApp.deleteComfirm);

exports.init = function(app){
	app.use(preModule);

	app.use(publicRouter);
	app.use(staticRouter);

	app.get("/", redirectToFront);
	app.get("/!logout", disableMenu, user.logout);
	app.get("/!signup", disableMenu, user.signupForm);
	app.post("/!login", disableMenu, user.login);
	app.post("/!signup", disableMenu, user.signup);

	app.post("/!api/1/save", user.checkApiPermission(user.PERMISSION.WRITE), wikiApi.save);

	app.use(appRouter);
	app.use(wikiView);
}


function preModule(req, res, next){
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
function staticRouter(req, res, next){
	var filePath = path.join(config.wikiDir, decodeURIComponent(req.path));

	if(staticRegex.test(req.path)){
		res.sendfile(filePath);
	} else {
		next();
	}
}
var publicRegex = /^\/!public\/.*$/;
function publicRouter(req, res, next){
	if(publicRegex.test(req.path)){
		res.sendFile(req.path.substring(2));
	} else {
		next();
	}
}

function wikiView(req, res, next){
	user.checkPermission(user.PERMISSION.READ)(req, res, function(){
		wikiApp.view(req, res, next);
	});
}

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
