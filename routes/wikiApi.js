var wikiFS = require("../app/wikiFS");
var user = require("../app/user");
var WikiPath = require("../app/wikipath");

var userApp = require("./userApp");

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

exports.files = function(req, res){
	var wikipath = new WikiPath(req.query.location);
	wikiFS.fileList(wikipath).then(function(files){
		res.status(200).jsonp(files);
	}).fail(function(err){
		res.status(500).jsonp(err);
	});
}
exports.delete = function(req, res) {
	var wikipath = new WikiPath(req.query.location);
	wikiFS.deleteWiki(wikipath).then(function(){
		res.status(200).jsonp({});
	}).fail(function(e){
		res.status(500).jsonp(e);
	});
}
