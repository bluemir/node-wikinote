var config = require("../config");
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
}

exports.preModule = function(req, res, next){
	req.wikiPath = new Path(req.path);
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

