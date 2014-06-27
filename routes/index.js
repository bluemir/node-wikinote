var path = require("path");
var Path = require("./path.js");
var user = require("./userApp.js");
var wikiApp = require("./wikiApp.js");
var config = require("../config");

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
	wikiApp.checkReadPermission(req, res, function(){
		wikiApp.view(req, res, next);
	});
}

var paramRouter = ParamRouter();
paramRouter.get("view", wikiApp.checkReadPermission, wikiApp.view);
paramRouter.get("edit", wikiApp.checkWritePermission, wikiApp.edit);
paramRouter.get("attach", wikiApp.checkWritePermission, wikiApp.attach);
paramRouter.get("move", wikiApp.checkWritePermission, wikiApp.moveForm);
paramRouter.get("presentation", wikiApp.checkReadPermission, wikiApp.presentation);
paramRouter.get("find", wikiApp.checkReadPermission, wikiApp.find);
paramRouter.get("delete", wikiApp.checkWritePermission, wikiApp.deleteForm);
paramRouter.get("history", wikiApp.checkReadPermission, wikiApp.history);

paramRouter.post("edit", wikiApp.checkWritePermission, wikiApp.save);
paramRouter.post("attach", wikiApp.checkWritePermission, wikiApp.upload);
paramRouter.post("move", wikiApp.checkWritePermission, wikiApp.move);
paramRouter.post("delete", wikiApp.checkWritePermission, wikiApp.deleteComfirm);

exports.paramRouter = paramRouter;

function ParamRouter(){

	var _map = {
		get : {},
		post : {}
	};

	function router(req, res, next){
		var method = req.method.toLowerCase();
		for(var key in _map[method]){
			if(key in req.query){
				return _map[method][key](req, res, next);
			}
		}

		next();
	}
	router.get = function(name, funcs){
		_map.get[name] = makeChain(arguments);
	}
	router.post  = function(name, funcs){
		_map.post[name] = makeChain(arguments);
	}
	function makeChain(args){
		var chain = [].filter.call(args, function(elem, index){
			return index != 0;
		});
		return function(req, res, next){
			var count = 0;
			chain[count](req, res, onComplete);

			function onComplete(){
				if(count >= chain.length) {
					return next();
				}
				chain[++count](req, res, onComplete);
			}
		}
	}

	return router;
}

