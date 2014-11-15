var async = require("async");
var wikiFS = require("../app/wikiFS");
var userModule = require("../app/user");

var plugins = require("../plugins/config.js");

var menus = [];

exports.menus = function(){
	return menus;
}

exports.postArticle = function(wikipath, user, callback){
	async.map(plugins.postArticle, process, function(err, results){
		var html = results.reduce(function(prev, curr){
			return prev + curr;
		}, "");
		callback(null, html);
	});

	function process(plugin, callback){
		plugin(new PluginInterface(wikipath, user), callback);
	}
}

exports.initAction = function(paramRouter){
	var action = plugins.action;
	for(var name in action.get){
		if (name[0] == "$"){
			//ignore menu
			paramRouter.get(name.substr(1), actionHandler(action.get[name]));
		} else if (name[0] == "@") {
			menus.push(name.substr(1));
			paramRouter.get(name.substr(1), action.get[name](RawActionInterface));
		} else {
			menus.push(name);
			paramRouter.get(name, actionHandler(action.get[name]));
		}
	}
	for(var name in action.post){
		if (name[0] == "$"){
			//ignore menu
			paramRouter.post(name.substr(1), actionHandler(action.post[name]));
		} else if (name[0] == "@") {
			paramRouter.post(name.substr(1), action.post[name](RawActionInterface));
		} else {
			paramRouter.post(name, actionHandler(action.post[name]));
		}
	}

	function actionHandler(handler){
		return function(req, res, next){
			var actionInterface = new ActionInterface(req, res, next);

			handler(actionInterface);
		}
	}
}

function PluginInterface(wikipath, user){
	this.path = wikipath;
	this.user = user;
}
PluginInterface.prototype.readFile = function(path, callback){
	//TODO check arguments
	wikiFS.readFile(path, callback);
}
PluginInterface.prototype.writeFile = function(path, data, callback){
	wikiFS.writeFile(path, data, this.user, callback);
}
PluginInterface.prototype.hasPermission = function(permission, callback){
	userModule.hasPermission(this.user ? this.user.id : null, callback);
}

ActionInterface.prototype = new PluginInterface();
function ActionInterface(req, res, next){
	this.path = req.wikiPath;
	this.user = req.session.user;
	this._ = {
		req : req,
		res : res,
		next : next
	};
}
ActionInterface.prototype.param = function(){
	var req = this._.req;
	return req.param.apply(req, arguments);
}
ActionInterface.prototype.redirect = function(){
	var res = this._.res;
	return res.redirect.apply(res, arguments);
}
ActionInterface.prototype.flash = function(){
	var req = this._.req;
	return req.flash.apply(req, arguments);
}

exports.assets = function(app, express){
	for(var name in plugins.assets){
		app.use("/!plugins/" + name, express.static(plugins.assets[name]));
	}
}

RawActionInterface = function(req, res){
	return {
		path : req.wikiPath,
		user : req.session.user
	}
}
RawActionInterface.readFile = function(path, callback){
	wikiFS.readFile(path, callback);
}

