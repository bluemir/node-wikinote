
module.exports = ParamRouter;


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
