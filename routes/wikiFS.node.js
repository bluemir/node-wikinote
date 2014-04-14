var fs = require("fs");
var mkdirp = require("mkdirp");
var exec = require("child_process").exec;
var config = require("../config");

var SearchEngine = require("./searchEngine.node.js")
var searchEngine = new SearchEngine(config.wikiDir);

exports.readWiki = function(path, callback){
	fs.readFile(config.wikiDir + path.full + ".md", "utf8", function(err, data){
		if(err){
			callback(err);
			return;
		}
		callback(null, data);
	});
}
exports.writeWiki = function(path, data, author, callback){
	mkdirp(config.wikiDir + path.toString(), function(){
		fs.writeFile(config.wikiDir + path.full + ".md", data, "utf8", function(err){
			if(!err)
				backup("update", path.full, author, callback);
			else
				callback(err);
		});
	})
}
exports.fileList = function(path, callback){
	fs.readdir(config.wikiDir + path.full, callback);
}
exports.acceptFile  = function(srcPath, path, name, callback){
	mkdirp(config.wikiDir + path.toString(), function(){
		fs.readFile(srcPath, function(e, data){
			if(e) return callback(e);
			fs.writeFile(config.wikiDir + path.full + "/" + name, data, callback);
		});
	});
}
exports.deleteFile = function(path, callback){
	fs.unlink(config.wikiDir + path, function(e){
		console.log(e);
		fs.unlink(config.wikiDir + path + ".md", callback );
	});
}
exports.move = function(srcPath, targetPath, callback){
	mkdirp(config.wikiDir + path.toString(), function(){
		fs.rename(config.wikiDir + srcPath.full, config.wikiDir + targetPath.full,function(e){
			console.log(e);
		});
		fs.rename(config.wikiDir + srcPath.full + ".md", config.wikiDir + targetPath.full + ".md", function(e){
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
	var command = "git log --pretty=format:'" + logFormat + "' -- " + config.wikiDir + path + ".md";
	exec(command, {cwd : config.wikiDir}, function(e, stdout, stderr){
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

	exec(command, {cwd : config.wikiDir}, function(e, stdout, stderr){
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
