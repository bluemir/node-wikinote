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
exports.writeWiki = function(path, data, author, callback){
	readyDir(path, function (){
		fs.writeFile(saveDir + path.full + ".md", data, "utf8", function(err){
			if(!err)
				backup("update", path.full, author, callback);
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
	//%c  : date
	//%s  : subject
	//%h  : hash id
	//%an : author name
	//%ae : author email
	var logFormat = "%cD%x01%s%x01%h%x01%an%x01%ae"
	var command = "git log --pretty=format:'" + logFormat + "' -- " + saveDir + path + ".md";
	exec(command, {cwd : saveDir}, function(e, stdout, stderr){
		var logs = stdout.split(/[\n\r]/g).map(function(log, index){
			var tmp = log.split("\x01");
			return { 
				date : tmp[0], 
				subject : tmp[1], 
				id : tmp[2],
				author : {
					name : tmp[3],
					email : tmp[4]
				}
			};
		});
		callback(null, logs);
	});
} 
function readyDir(path, callback){
	var pathArray = path.toArray();

	checkDir(pathArray.length, function(err, level){
		if(err) return callback(err);

		mkdir(level + 1, callback);
	});

	function checkDir(level, callback){
		if(level < 0) return callback(new Error());

		fs.exists(getPath(level), function(exist){
			if(exist) return callback(null, level);
			checkDir(level - 1, callback);
		});
	}

	function mkdir(level, callback){
		if(level > pathArray.length) return callback(null);

		fs.mkdir(getPath(level), function(err){
			mkdir(level + 1, callback);
		});
	}

	function getPath(level){
		return saveDir + "/" + pathArray.slice(0, level).join("/");
	}
}
function backup(method, fullname, author, callback){
	if(!config.autoBackup){
		callback();
		return;
	}
	
	var message = method + " : " + fullname
	
	var command = "git add .;"
	command += "git commit -a ";
	command += "-m" + wapper(buildMessage(method, fullname));
	command += "--author" + wapper(signature(author));

	exec(command, {cwd : saveDir}, function(e, stdout, stderr){
		callback();			
	});
	
	function wapper(str){
		return " '" + str + "' ";
	}
	function signature(author){
		if(!author){
			return "anomymous <anomymous@wikinote>";
		}
		var id = author.id || "anomymous";
		var email = author.email || id + "@wikinote";
		
		return id + " <" + email + ">";
	}
	function buildMessage(method, notename){
		return method + " : " + notename;
	}
}
