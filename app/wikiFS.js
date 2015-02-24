var Q = require("q");
var fs = require("fs");
var mkdirp = Q.denodeify(require("mkdirp"));
var exec = Q.denodeify(require("child_process").exec);
var config = require("../config");

var nfs = {
	readFile : Q.denodeify(fs.readFile),
	writeFile : Q.denodeify(fs.writeFile),
	readdir : Q.denodeify(fs.readdir),
	unlink : Q.denodeify(fs.unlink)
}

var SearchEngine = require("./searchEngine")
var searchEngine = new SearchEngine(config.wikiDir);

exports.readWiki = function(path){
	return nfs.readFile(config.wikiDir + path.full + ".md", "utf8");
}
exports.writeWiki = function(path, data, author){
	return mkdirp(config.wikiDir + path.toString())
		.then(nfs.writeFile(config.wikiDir + path.full + ".md", data, "utf8"))
		.then(backup("update", path.full, author))
		.then(function(){
			callback();
		})
		.fail(function(err){
			callback(err);
		});
}
exports.readFile = function(path){
	return nfs.readFile(config.wikiDir + path.full, "utf8");
}
exports.writeFile = function(path, data, author, callback){
	return mkdirp(config.wikiDir + path.path)
		.then(nfs.writeFile(config.wikiDir + path.full, data, "utf8"))
		.then(backup("update", path.full, author));
}
exports.fileList = function(path, callback){
	return nfs.readdir(config.wikiDir + path.toString())
		.then(function(files){
			return files.filter(notStartDot);
		});

	function notStartDot(filename){
		return filename[0] != ".";
	}
}
exports.acceptFile  = function(srcPath, path, name, callback){
	mkdirp(config.wikiDir + path.toString(), function(){
		fs.readFile(srcPath, function(e, data){
			if(e) return callback(e);
			fs.writeFile(config.wikiDir + path.full + "/" + name, data, callback);
		});
	});
}
exports.deleteWiki = function(path, callback){
	fs.unlink(config.wikiDir + path.toString(), function(e){
		console.log(e);
		fs.unlink(config.wikiDir + path + ".md", callback );
	});
}
exports.move = function(srcPath, targetPath, callback){
	mkdirp(config.wikiDir + targetPath.toString(), function(){
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

	return exec(command, {cwd : config.wikiDir}).spread(function(stdout, stderr){
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
		return logs;
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

	return exec(command, {cwd : config.wikiDir});

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
