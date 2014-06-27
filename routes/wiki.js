var config = require("../config");
var wikiApp = require("./wikiApp.js");
var wikiApi = require("./wikiApi.js");
var user = require("./userApp.js");

exports.init = function(app){
	app.get("/", redirectToFront);
	app.get("/!logout", disableMenu, user.logout);
	app.get("/!signup", disableMenu, user.signupForm);
	app.get("/!user", disableMenu, user.checkAdminPermission, user.list)
	app.post("/!login", disableMenu, user.login);
	app.post("/!signup", disableMenu, user.signup);

	app.post("/!api/1/save", wikiApi.checkWritePermission, wikiApi.save);
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

