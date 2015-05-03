module.exports = SearchEngine;

var Q = require("q");
var fs = require("fs");
var pathutil = require("path");

var nfs = require("./nfs");
function SearchEngine(path){
	this.rootpath = path;
}

SearchEngine.prototype.search = function(keywords, path){
	return find(this.rootpath, path, new RegExp(keywords)).all().then(function(result){
		return result.filter(notNull);
	});
}

function find(rootpath, wikipath, regexp){
	return nfs.stat(nfs.join(rootpath, wikipath)).then(function(stat){
		if(stat.isDirectory()){
			return handleDirectory(rootpath, wikipath, regexp)
		} else {
			return [handleFile(rootpath, wikipath, regexp)].filter(notNull);
		}
	});
}

function handleDirectory(rootpath, wikipath, regexp){
	return nfs.readdir(nfs.join(rootpath, wikipath)).then(function(names){
		var results = names.filter(notStartWithDot).map(function(name){
			return find(rootpath, nfs.join(wikipath, name), regexp);
		});

		return Q.all(results).then(function(results){
			return results.reduce(concat, []);
		});
	});
}
function handleFile(rootpath, wikipath, regexp){
	return Q.all([
		checkFileName(wikipath, regexp),
		checkFile(rootpath, wikipath, regexp)
	]).spread(function(name, file){
		return file || name;
	});
}
function checkFileName(wikipath, regexp){
	var name = nfs.basename(wikipath);

	if(regexp.test(name)) {
		if(nfs.extname(name) == ".md"){
			return { path : wikipath.slice(0, -3)}; //for remove ext
		} else {
			return { path : wikipath };
		}

	}
	return null;
}
function checkFile(rootpath, wikipath, regexp){
	if(nfs.extname(wikipath) != ".md"){
		return null;
	}

	var filename = nfs.basename(wikipath);

	//TODO improve performance with event stream
	return nfs.readFile(nfs.join(rootpath, wikipath), {encoding :"utf8"}).then(function(data){
		var lines = data.split(/[\r\n]+/).map(function(line, index){
			if(regexp.test(line)){
				return {num : index + 1, value : line};
			}
			return null;
		}).filter(notNull);

		if(lines.length != 0){
			return {
				path : wikipath.slice(0, -3), //for remove ext
				lines : lines
			}
		} else {
			return null;
		}
	});
}

function notStartWithDot(name){
	return name[0] != ".";
}
function notNull(value){
	return value != null;
}
function concat(a, b){
	return a.concat(b);
}
