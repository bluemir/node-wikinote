function $ajax(method, url, options){
	options = options || {};

	return Q.promise(function(resolve, reject, notify){
		var req = new XMLHttpRequest();
		req.open(method, url);
		if(options.contentType){
			req.setRequestHeader("Content-Type", options.contentType);
		}
		req.addEventListener("load", function(){
			if(req.status >= 200 && req.status < 300){ //SUCCESS
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

