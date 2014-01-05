module.exports = SearchEngine;

var fs = require("fs");
var pathutil = require("path");
var SEP = require("path").sep;

function SearchEngine(path){
	this.rootPath = path;
}

SearchEngine.prototype.search = function(keywords, path, callback){
	find(new RegExp(keywords), this.rootPath + "/" + path, callback);	
}
function find(regex, wikiPath, callback){
	var result = [];

	fs.readdir(wikiPath, function(err, names){
		if(names.length === 0) callback(null, result);
		
		var counter = names.length;
		if(err) { console.log("#", err);return callback(err);}
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
		if(regex.test(name)){
			//add filename to result set
			result.push({ path : wikiPath + "/" + name, name : name});
			callback();
		} else if(pathutil.extname(name) == ".md"){
			//find keyword in file
			fs.readFile(wikiPath + "/" +  name, {encoding :"utf8"}, function(err, data){
				if(err) return console.log("#", err);
				//TODO improve performance	
				var lines = data.split(/[\r\n]/);
				for(var i = 0; i < lines.length; i++){
					var line = lines[i];
					if(regex.test(line)){
						result.push({ path : wikiPath + "/" + name, name : name, line : line});
					}
				}
				callback();
			});
		} else {
			//check is dir
			var nextPath = wikiPath  + "/"  + name;
			fs.stat(nextPath, function(err, stat){
				if(err) return console.log("#", err);
				if(stat.isDirectory()){	
					find(regex, nextPath, function(err, data){
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

function isMarkdown(name){
	return pathutil.extname(name) == ".md"
}
