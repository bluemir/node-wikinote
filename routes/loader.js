var async = require("async");
var wikiFS = require("../app/wikiFS");

var plugins = require("../plugins/config.js");

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
		if(name[0] == "$"){
			//ignore menu
			paramRouter.get(name.substr(1), actionHandler(action.get[name]));
		} else {
			paramRouter.get(name, actionHandler(action.get[name]));
		}
	}
	for(var name in action.post){
		if(name[0] == "$"){
			//ignore menu
			paramRouter.post(name.substr(1), actionHandler(action.post[name]));
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
