var express = require("express");
var path = require("path");
var WikiPath = require("./wikipath");
var user = require("./userApp");
var wikiApp = require("./wikiApp");
var wikiApi = require("./wikiApi");
var loader = require("./pluginLoader");
var config = require("../config");
var ParamRouter = require("./paramRouter");
var LayoutManager = require("./layoutManager");

exports.init = function(app){
	loader.assets(app);

	app.use(preModule);
	app.use(user.middleware);

	app.get("/", redirectToFront);
	app.get("/!logout", specialPage,  user.logout);
	app.get("/!signup", specialPage, user.signupForm);
	app.get("/!login", specialPage, user.loginForm);
	app.post("/!login", specialPage, user.login);
	app.post("/!signup", specialPage, user.signup);
	app.get("/!search", specialPage, wikiApp.search);

	if(config.security) {
		app.get("/!users", specialPage, user.checkPermission(user.PERMISSION.ADMIN), user.list);
		app.get("/!users/:userId", specialPage, user.profile);
		app.post("/!users/:userId", specialPage, user.saveProfile);
	}

	app.use(user.checkPermission(user.PERMISSION.READ), express.static(config.wikiDir, {
		dotfiles: 'ignore',
		index: false,
		redirect: false
	}));

	app.get("/!api/1/files", user.checkApiPermission(user.PERMISSION.READ), wikiApi.files);
	app.post("/!api/1/save", user.checkApiPermission(user.PERMISSION.WRITE), wikiApi.save);
	app.post("/!api/1/upload", user.checkApiPermission(user.PERMISSION.WRITE), wikiApi.upload);
	app.post("/!api/1/delete", user.checkApiPermission(user.PERMISSION.WRITE), wikiApi.delete);

	if(config.security){
		app.delete("/!api/1/user/:userId", user.checkApiPermission(user.PERMISSION.ADMIN), user.deleteUser);
		app.put("/!api/1/user/:userId/permission/:permission", user.checkApiPermission(user.PERMISSION.ADMIN), user.addPermission);
		app.delete("/!api/1/user/:userId/permission/:permission", user.checkApiPermission(user.PERMISSION.ADMIN), user.deletePermission);
	}
	var appRouter = ParamRouter();
	appRouter.get("view", user.checkPermission(user.PERMISSION.READ), wikiApp.view);
	appRouter.get("edit", user.checkPermission(user.PERMISSION.WRITE), wikiApp.edit);
	appRouter.get("attach", user.checkPermission(user.PERMISSION.WRITE), wikiApp.attach);
	appRouter.get("move", user.checkPermission(user.PERMISSION.WRITE), wikiApp.moveForm);
	appRouter.get("delete", user.checkPermission(user.PERMISSION.WRITE), wikiApp.deleteForm);
	appRouter.get("history", user.checkPermission(user.PERMISSION.READ), wikiApp.history);
	appRouter.get("backlinks", user.checkPermission(user.PERMISSION.READ), wikiApp.backlinks);

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
	res.locals.layoutManager = new LayoutManager();
	next();
}

function redirectToFront(req, res){
	res.redirect(307, "/" + config.frontPage);
}

function specialPage(req, res, next){
	res.locals.layoutManager.setSpecialPage();
	next();
}

