var wikiFS = require("../app/wikiFS");
var config = require("../config");
var userApp = require("./userApp");
var user = require("../app/user");
var WikiPath = require("./wikipath");

exports.save = function(req, res){
	var data = req.body.data;
	var location = req.query.location;
    var wikipath = new WikiPath(location);

	wikiFS.writeWiki(wikipath, data, req.session.user).then(function(){
		res.status(200).json({});
	}).fail(function(err){
		return res.status(500).json(err);
	});
}
exports.upload = function(req, res){
	var file = req.files.file;
	var location = req.query.location;
	var wikipath = new WikiPath(location);

	wikiFS.acceptFile(file.path, wikipath, file.name).then(function(){
		res.redirect(req.path + "?attach");
	}).fail(function(err){
		res.status(500).jsonp(err);
	});
}
exports.files = function(req, res){
	var wikipath = new WikiPath(req.query.location);
	wikiFS.fileList(wikipath).then(function(files){
		res.status(200).jsonp(files);
	}).fail(function(err){
		res.status(500).jsonp(err);
	});
}
