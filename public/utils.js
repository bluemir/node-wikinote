function $(query){
	return document.querySelector(query);
}
function $ajax(method, url, options){
	options = options || {};

	return Q.promise(function(resolve, reject, notify){
		var req = new XMLHttpRequest();
		req.open(method, url);
		if(options.contentType){
			req.setRequestHeader("Content-Type",options.contentType);
		}
		req.addEventListener("load", function(){
			if(req.status == 200){ //TODO FIX SUCCESS CHECK : for 2xx eg. 201
				resolve({
					type : req.responseType,
					data : req.response,
					text : req.responseText,
					status : req.status
				});
			} else {
				reject(req.status);
			}
		});
		req.addEventListener("progress", function(evt){
			notify(evt.loaded / evt.total);
		});
		req.send(options.data);
	});
}
function $create(tagname, text){
	var newTag = document.createElement(tagname);

	if (text){
		newTag.appendChild(document.createTextNode(text));
	}
	return newTag;
}

Q.step = function(object, step, time){
	if (time === void 0) {
		time = step;
		step = object;
		object = void 0;
	}
	return Q(object).step(step, time);
}

Promise.prototype.step = function (step, time){
	return this.then(function (value){
		var deferred = defer();

		var dt = time/step;
		var count = 0;

		var onTimer = function(){
			count++;
			deferred.notify(count/step);
			if(count < step){
				setTimeout(onTimer, dt);
			} else {
				deferred.resolve(value);
			}
		}

		setTimeout(onTimer, dt);
		return deferred.promise;
	});
}
