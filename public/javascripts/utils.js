function $(query){
	return document.querySelector(query);
}
function $$(target, query) {
	return target.querySelector(query);
}
function $all(query){
	return Array.prototype.slice.call(document.querySelectorAll(query));
}
function $$all(target, query){
	return Array.prototype.slice.call(target.querySelectorAll(query));
}
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
function $create(tagname, text){
	var newTag = document.createElement(tagname);

	if (text){
		newTag.appendChild(document.createTextNode(text));
	}
	return newTag;
}

if (!('remove' in Element.prototype)) {
	Element.prototype.remove = function() {
		this.parentElement.removeChild(this);
	};
}
