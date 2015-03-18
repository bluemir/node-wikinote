function $(query){
	return document.querySelector(query);
}
function $ajax(method, url, data){
	return Q.promise(function(resolve, reject, notify){
		var req = new XMLHttpRequest();
		req.open(method, url);
		req.addEventListener("load", function(){
			if(req.status == 200){
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
		req.send(data);
	});
}

