var Q = require("q");
var fs = require("fs");
var nfs = require("./nfs");
var exec = Q.denodeify(require("child_process").exec);
var config = require("../config");
var SearchEngine = require("./searchEngine")
var searchEngine = new SearchEngine(config.wikiDir);

exports.readWiki = function(path){
	return nfs.readFile(config.wikiDir + path.full + ".md", "utf8");
}
exports.writeWiki = function(path, data, author){

	return nfs.mkdirp(config.wikiDir + path.toString())
		.then(function(){
			return nfs.writeFile(config.wikiDir + path.full + ".md", data, "utf8")
		})
		.then(function(){
			backup("update", path.full, author)
		});
}
exports.readFile = function(path){
	return nfs.readFile(config.wikiDir + path.full, "utf8");
}
exports.writeFile = function(path, data, author){
	return nfs.mkdirp(config.wikiDir + path.path)
		.then(function(){
			return nfs.writeFile(config.wikiDir + path.full, data, "utf8")
		})
		.then(function(){
			backup("update", path.full, author)
		});
}
exports.fileList = function(path){
	return nfs.readdir(config.wikiDir + path.toString())
		.then(function(files){
			return files.filter(notStartDot);
		});

	function notStartDot(filename){
		return filename[0] != ".";
	}
}
exports.acceptFile  = function(srcPath, path, name){
	return nfs.mkdirp(config.wikiDir + path.toString()).then(function(){
		return Q.promise(function(resolve, reject){
			var readStream = fs.createReadStream(srcPath)
			var writeStream = fs.createWriteStream(config.wikiDir + path.full + "/" + name);

			readStream.pipe(writeStream);

			writeStream.on("finish", resolve).on("error", reject);
		});
	});
}
exports.deleteWiki = function(path){
	return Q.all([
		nfs.unlink(config.wikiDir + path.toString()),
		nfs.unlink(config.wikiDir + path + ".md")
	]);
}
exports.move = function(srcPath, targetPath){
	return nfs.mkdirp(config.wikiDir + targetPath.toString())
		.all([
			nfs.rename(config.wikiDir + srcPath.full, config.wikiDir + targetPath.full),
			nfs.rename(config.wikiDir + srcPath.full + ".md", config.wikiDir + targetPath.full + ".md")
		]);
}
exports.find = function(word, path){
	return searchEngine.search(word, path + "");
}
exports.history = function(path){
	//%cD : date
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
function backup(method, fullname, author){
	if(!config.autoBackup){
		return Q();
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

function updateBacklinks(wikipath, data){
	//marked lexer
	//links resolve
	//update .backlinks

}
function updateLink(from, to){
	//add back index
}
