var fs = require("fs");
var exec = require("child_process").exec;
var config = require("./config.node.js");

var saveDir = config.wikiDir;

var SearchEngine = require("./searchEngine.node.js")
var searchEngine = new SearchEngine(saveDir);

exports.readWiki = function(path, callback){
	fs.readFile(saveDir + path.full + ".md", "utf8", function(err, data){
		if(err){
			callback(err);
			return;
		}
		callback(null, data);
	});
}
exports.writeWiki = function(path, data, callback){
	readyDir(path.path, function (){
		fs.writeFile(saveDir + path.full + ".md", data, "utf8", function(err){
			if(!err)
				backup(path.full, callback);
			else
				callback(err);
		});
	})
}
exports.fileList = function(path, callback){
	fs.readdir(saveDir + path.full, callback);
}
exports.acceptFile  = function(srcPath, path, name, callback){
	readyDir(path.full, function(){
		fs.readFile(srcPath, function(e, data){
			if(e) return callback(e);
			fs.writeFile(saveDir + path.full + "/" + name, data, callback);
		});
	});
}
exports.deleteFile = function(path, callback){
	fs.unlink(saveDir + path, function(e){
		console.log(e);
		fs.unlink(saveDir + path + ".md", callback );
	});
}
exports.move = function(srcPath, targetPath, callback){
	readyDir(targetPath.path, function(e){
		fs.rename(saveDir + srcPath.full, saveDir + targetPath.full,function(e){
			console.log(e);
		});
		fs.rename(saveDir + srcPath.full + ".md", saveDir + targetPath.full + ".md", function(e){
			console.log(e);
			callback(null);
		});
	});
}
exports.find = function(path, word, callback){
	searchEngine.search(word, path, callback);
}
exports.history = function(path, callback){
	exec("git log '--pretty=tformat:%ci\01%s\01%h' -- " + saveDir + path + ".md", {cwd : saveDir}, callback);
} 
function readyDir(path, callback){
	fs.mkdir(saveDir + path, callback);
}
function backup(fullname, callback){
	if(!config.autoBackup){
		callback();
		return;
	}
	exec('git add --all .', {cwd : saveDir}, function(){
		exec('git commit -m "update : ' + fullname + '"', {cwd : saveDir}, function(){
			callback();			
		});
	});
}

