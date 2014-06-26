module.exports = wikiPath;

function wikiPath(path){
	this.full = nomalizePath(decodeURIComponent(path));
	var index = this.full.lastIndexOf("/");
	if(index == 0){
		this.path = "/";
	} else {
		this.path = this.full.substr(0, index);
	}
	this.name = this.full.substr(index + 1);
}
wikiPath.prototype.toString = function(){
	return this.full;
}
wikiPath.prototype.toArray = function(){
	return this.full.split("/").slice(1);
}
wikiPath.prototype.encode = function(){
	return encodeURIComponent(this.full);
}
function nomalizePath(path){
	if(path[path.length -1] == "/"){
		return path.substr(0, path.length -2);
	}
	else {
		return path;
	}
}
