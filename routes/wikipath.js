module.exports = WikiPath;

function WikiPath(PATH){
	var path = "";
	Object.defineProperty(this, "full", {
		get : function(){
			return path;
		},
		set : function(str){
			path = nomalizePath(decodeURIComponent(str));
		},
		enumerable : true
	});
	Object.defineProperty(this, "name", {
		get : function(){
			var index = this.full.lastIndexOf("/");
			return path.substr(index + 1);
		},
		enumerable : true
	});
	Object.defineProperty(this, "path", {
		get : function(){
			var index = this.full.lastIndexOf("/");
			return path.substr(0, index);
		},
		enumerable : true
	});
	this.full = PATH;
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
