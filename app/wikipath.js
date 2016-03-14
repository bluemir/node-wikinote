var resolve = require("path").resolve;
module.exports = WikiPath;

function WikiPath(PATH){
	var path = "";
	var index = 0;
	var base = "";
	var name = "";
	Object.defineProperty(this, "full", {
		get : function(){
			return path;
		},
		set : function(str){
			path = nomalizePath(str);
			var index = path.lastIndexOf("/");
			base = path.substr(0, index);
			name = path.substr(index + 1);
		},
		enumerable : true
	});
	Object.defineProperty(this, "name", {
		get : function(){
			return name;
		},
		enumerable : true
	});
	Object.defineProperty(this, "path", {
		get : function(){
			return base;
		},
		enumerable : true
	});
	this.full = PATH;
}
WikiPath.decode = function(PATH){
	return new WikiPath(decodeURIComponent(PATH));
}
WikiPath.prototype.toString = function(){
	return this.full;
}
WikiPath.prototype.toArray = function(){
	return this.full.split("/").filter(function(str){return str != "";});
}
WikiPath.prototype.bread = function(){
	var arr = this.toArray();
	var result = [];
	for(var i = 0; i < arr.length; i++){
		result[i] = {
			path : "/" + arr.slice(0, i+1).join('/'),
			name : arr[i]
		}
	}
	return result;
}
WikiPath.prototype.encode = function(){
	return encodeURIComponent(this.full);
}
WikiPath.prototype.append = function(name){
	return new WikiPath(this.full + "/" + name);
}
WikiPath.prototype.copy = function(){
	return new WikiPath(this.full);
}
WikiPath.prototype.resolve = function(PATH){
	return new WikiPath(resolve(this.full, PATH));
}
function nomalizePath(path){
	if(path == "/"){
		return path;
	}

	if(path[path.length - 1] == "/"){
		return path.substr(0, path.length - 1);
	} else {
		return path;
	}
}
