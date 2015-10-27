var Q = require("q");
var fs = require("fs");
var path = require("path");

module.exports = {
	mkdirp : Q.denodeify(require("mkdirp")),
	readFile : Q.denodeify(fs.readFile),
	writeFile : Q.denodeify(fs.writeFile),
	appendFile : Q.denodeify(fs.appendFile),
	readdir : Q.denodeify(fs.readdir),
	unlink : Q.denodeify(fs.unlink),
	rmdir : Q.denodeify(fs.rmdir),
	rename : Q.denodeify(fs.rename),
	stat : Q.denodeify(fs.stat),
	join : path.join,
	extname : path.extname,
	basename : path.basename
}
