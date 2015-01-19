module.exports = WikiPath;

function WikiPath(path){
	this.full = nomalizePath(decodeURIComponent(path));
	var index = this.full.lastIndexOf("/");
	if(index == 0){
		this.path = "/";
	} else {
		this.path = this.full.substr(0, index);
	}
	this.name = this.full.substr(index + 1);
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
	var path = new WikiPath("/");
	path.full = this.full + "/" + name;
	var index = path.full.lastIndexOf("/");
	if(index == 0){
		path.path = "/";
	} else {
		path.path = path.full.substr(0, index);
	}
	path.name = path.full.substr(index + 1);
	return path;
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
