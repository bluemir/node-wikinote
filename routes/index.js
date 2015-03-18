var express = require("express");
var path = require("path");
var WikiPath = require("./wikipath");
var user = require("./userApp");
var wikiApp = require("./wikiApp");
var wikiApi = require("./wikiApi");
var loader = require("./pluginLoader");
var config = require("../config");
var ParamRouter = require("./paramRouter")

exports.init = function(app){
	loader.assets(app);

	app.use(preModule);
	app.use(user.middleware);

	app.get("/", redirectToFront);
	app.get("/!logout", disableMenu, user.logout);
	app.get("/!signup", disableMenu, user.signupForm);
	app.get("/!login", disableMenu, user.loginForm);
	app.post("/!login", disableMenu, user.login);
	app.post("/!signup", disableMenu, user.signup);
	app.get("/!search", disableMenu, wikiApp.search);

	app.use(user.checkPermission(user.PERMISSION.READ), express.static(config.wikiDir, {
		dotfiles: 'ignore',
		index: false,
		redirect: false
	}));

	app.get("/!api/1/files", user.checkApiPermission(user.PERMISSION.READ), wikiApi.files);
	app.post("/!api/1/save", user.checkApiPermission(user.PERMISSION.WRITE), wikiApi.save);
	app.post("/!api/1/upload", user.checkApiPermission(user.PERMISSION.WRITE), wikiApi.upload);

	var appRouter = ParamRouter();
	appRouter.get("view", user.checkPermission(user.PERMISSION.READ), wikiApp.view);
	appRouter.get("edit", user.checkPermission(user.PERMISSION.WRITE), wikiApp.edit);
	appRouter.get("attach", user.checkPermission(user.PERMISSION.WRITE), wikiApp.attach);
	appRouter.get("move", user.checkPermission(user.PERMISSION.WRITE), wikiApp.moveForm);
	appRouter.get("delete", user.checkPermission(user.PERMISSION.WRITE), wikiApp.deleteForm);
	appRouter.get("history", user.checkPermission(user.PERMISSION.READ), wikiApp.history);

	appRouter.post("edit", user.checkPermission(user.PERMISSION.WRITE), wikiApp.save);
	appRouter.post("attach", user.checkPermission(user.PERMISSION.WRITE), wikiApp.upload);
	appRouter.post("move", user.checkPermission(user.PERMISSION.WRITE), wikiApp.move);
	appRouter.post("delete", user.checkPermission(user.PERMISSION.WRITE), wikiApp.deleteConfirm);

	loader.actions(appRouter);

	app.use(appRouter);

	app.use(user.checkPermission(user.PERMISSION.READ), wikiApp.view);
}

function preModule(req, res, next){
	res.locals.wikipath = req.wikipath = WikiPath.decode(req.path);
	res.locals.config = config;
	res.locals.utils = {
		flash : req.flash.bind(req)
	}
	res.locals.menus = loader.menus();
	next();
}

function redirectToFront(req, res){
	res.redirect("/" + config.frontPage);
}

function disableMenu(req, res, next) {
	res.locals.disableMenu = true;
	next();
}
