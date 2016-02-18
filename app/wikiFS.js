var Q = require("q");
var fs = require("fs");
var nfs = require("./nfs");
var exec = Q.denodeify(require("child_process").exec);
var config = require("../config");
var SearchEngine = require("./searchEngine")
var searchEngine = new SearchEngine(config.wikiDir);
var backlink = require("./backlink");
var Git = require("nodegit");
var history = require("./history")

exports.readWiki = function(path){
	return nfs.readFile(config.wikiDir + path.full + ".md", "utf8");
}
exports.writeWiki = function(wikipath, data, author){

	backlink.update(wikipath.toString(), data).fail(function(err){
		console.log(err, err.stack);
	});

	return nfs.mkdirp(config.wikiDir + wikipath.toString())
		.then(function(){
			return nfs.writeFile(config.wikiDir + wikipath.full + ".md", data, "utf8")
		})
		.then(function(){
			backup("update", wikipath, author)
		});
}
exports.readFile = function(path){
	return nfs.readFile(config.wikiDir + path.full, "utf8");
}
exports.writeFile = function(wikipath, data, author){
	return nfs.mkdirp(config.wikiDir + wikipath.path)
		.then(function(){
			return nfs.writeFile(config.wikiDir + wikipath.full, data, "utf8")
		})
		.then(function(){
			backup("update", wikipath, author)
		});
}
exports.fileList = function(path){
	return nfs.readdir(config.wikiDir + path.toString())
		.then(function(files){
			return files.filter(notStartDot);
		})
		.then(function(files){
			return Q.all(files.map(function(file){
				return nfs.stat(nfs.join(config.wikiDir, path.toString(), file)).then(function(stat){
					if(stat.isDirectory()){
						return null;
					} else {
						return file;
					}
				});
			})).then(function(files){
				return files.filter(notNull);
			});
		});
	function notStartDot(filename){
		return filename[0] != ".";
	}
	function notNull(e){
		return e != null;
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
		nfs.rmdir(config.wikiDir + path.toString()),
		nfs.unlink(config.wikiDir + path + ".md")
	]);
}
exports.move = function(srcPath, targetPath){
	backlink.move(srcPath, targetPath);

	return nfs.mkdirp(config.wikiDir + targetPath.toString())
		.all([
			nfs.rename(config.wikiDir + srcPath.full, config.wikiDir + targetPath.full),
			nfs.rename(config.wikiDir + srcPath.full + ".md", config.wikiDir + targetPath.full + ".md")
		]);
}
exports.find = function(word, flags, path){
	return searchEngine.search(word, flags, path + "");
}
exports.history = function(path){
	return history.getHistory(path);
}
exports.backlinks = function(path){
	return backlink.get(path);
}
function backup(method, wikipath, author){
	if(!config.autoBackup){
		return Q();
	}

	Q(history.commit(wikipath, method + ":" + wikipath.toString(), author)).fail(function(e){
		console.log(e, e.stack);
	});
	return Q();
}
