var fs = require("fs");
var exec = require("child_process").exec;
var config = require("./config.node.js");

var saveDir = config.wikiDir;

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
				backup(callback);
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
	//
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
	var exclude = ' --exclude-dir=".*" ';
	var include = ' --include="*.md"  ';
	//var include ="";
	exec('grep -r "' + word + '" ' + exclude + include , {cwd : saveDir + path.full},  function(e, stdout, stderr){
		exec('grep "' + word + '" "' + path.name + '.md"', { cwd : saveDir + path.path}, function( e2, stdout2, stderr2){
			callback(e || e2, {current : stdout2, subdir: stdout});
		});
	});
}

function readyDir(path, callback){
	fs.mkdir(saveDir + path, callback);
}
function backup(callback){
	if(!config.autoBackup){
		callback();
		return;
	}
	exec('git add .', {cwd : saveDir}, function(){
		exec('git commit -m "' + new Date().toLocaleString() + '"', {cwd : saveDir}, function(){
			callback();			
		});
	});
}