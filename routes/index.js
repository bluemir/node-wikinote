var path = require("path");
var user = require("./userApp.js");
var wikiApp = require("./wikiApp.js");
var config = require("../config");

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

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
	user.checkReadPermission(req, res, function(){
		wikiApp.view(req, res, next);
	});
}

var paramRouter = ParamRouter();
paramRouter.get("view", user.checkReadPermission, wikiApp.view);
paramRouter.get("edit", user.checkWritePermission, wikiApp.edit);
paramRouter.get("attach", user.checkWritePermission, wikiApp.attach);
paramRouter.get("move", user.checkWritePermission, wikiApp.moveForm);
paramRouter.get("presentation", user.checkReadPermission, wikiApp.presentation);
paramRouter.get("find", user.checkReadPermission, wikiApp.find);
paramRouter.get("delete", user.checkWritePermission, wikiApp.deleteForm);
paramRouter.get("history", user.checkReadPermission, wikiApp.history);

paramRouter.post("edit", user.checkWritePermission, wikiApp.save);
paramRouter.post("attach", user.checkWritePermission, wikiApp.upload);
paramRouter.post("move", user.checkWritePermission, wikiApp.move);
paramRouter.post("delete", user.checkWritePermission, wikiApp.deleteComfirm);

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

