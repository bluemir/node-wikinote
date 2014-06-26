module.exports = SearchEngine;

var fs = require("fs");
var pathutil = require("path");
var SEP = require("path").sep;

function SearchEngine(path){
	this.rootPath = path;
}

SearchEngine.prototype.search = function(keywords, path, callback){
	this.find(new RegExp(keywords), path, callback);	
}
SearchEngine.prototype.find = function(regex, wikiPath, callback){
	var that = this;
	var result = [];
	
	var realpath = that.rootPath + "/" + wikiPath + "/";

	fs.readdir(realpath, function(err, names){
		if(err) { console.log("#", err);return callback(err);}
		
		if(names.length === 0) callback(null, result);
		var counter = names.length;
		
		for(var i = 0; i < names.length; i++){
			var name = names[i];
			if(/^[.]/.test(name)){
				end();
				continue;
			}
			handleFile(name, end)
		}
		
		function end(){
			counter--;
			if(counter <= 0){
				callback(null, result);
			}
		}
	});
	
	function handleFile(name, callback){
		if(pathutil.extname(name) == ".md"){
			//find keyword in file
			fs.readFile(realpath + "/" +  name, {encoding :"utf8"}, function(err, data){
				if(err) return console.log("#", err);
				//TODO improve performance	
				var lines = data.split(/[\r\n]+/);
				var findLines = [];
				for(var i = 0; i < lines.length; i++){
					var line = lines[i];
					if(regex.test(line)){
						findLines.push({num : i + 1, value : line})
					}
				}
				if(findLines.length > 0){
					var basename = pathutil.basename(name, ".md")
					result.push({ path : wikiPath + "/" + basename, name : basename, lines : findLines});
				}
				callback();
			});
		} else if(regex.test(name)){
			//add filename to result set
			result.push({ path : wikiPath + "/" + name, name : name});
			callback();
		} else {
			//check is dir
			var nextPath = wikiPath  + "/"  + name;
			fs.stat(that.rootPath + "/" + nextPath, function(err, stat){
				if(err) return console.log("#", err);
				if(stat.isDirectory()){	
					that.find(regex, nextPath, function(err, data){
						if(err) console.log("#", err);
						//add result to result set
						result = result.concat(data);
						callback();
					});
					//callback();
				} else {
					callback();
				}
			});
		}
	}
}