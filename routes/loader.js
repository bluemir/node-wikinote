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
			paramRouter.get(name.substr(1), action.get[name](ActionInterface));
		} else {
			menus.push(name);
			paramRouter.get(name, action.get[name](ActionInterface));
		}
	}
	for(var name in action.post){
		if (name[0] == "$"){
			//ignore menu
			paramRouter.post(name.substr(1), action.post[name](ActionInterface));
		} else {
			paramRouter.post(name, action.post[name](ActionInterface));
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

exports.assets = function(app, express){
	for(var name in plugins.assets){
		app.use("/!plugins/" + name, express.static(plugins.assets[name]));
	}
}

ActionInterface = function(req, res){
	return {
		path : req.wikiPath,
		user : req.session.user
	}
}
ActionInterface.readFile = function(path, callback){
	wikiFS.readFile(path, callback);
}
ActionInterface.writeFile = function(path, data, user, callback){
	wikiFS.writeFile(path, data, user, callback);
}
