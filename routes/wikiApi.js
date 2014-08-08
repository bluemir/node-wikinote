var wikiFS = require("../app/wikiFS");
var config = require("../config");
var userApp = require("./userApp");
var user = require("../app/user")
var WikiPath = require("./wikipath");

exports.ch

exports.checkReadPermission = function(req, res, next){
	userApp.checkReadPermission(req.session.user, function(err, f){
		if (err) throw err;
		if (f) return next();
		else return res.json(401, {});
	});
}
exports.checkWritePermission = function(req, res, next){
	userApp.checkWritePermission(req.session.user, function(err, f){
		if (err) throw err;
		if (f) return next();
		else return res.json(401, {});
	});
}
exports.checkAdminPermission = function(req, res, next){
	userApp.checkAdminPermission(req.session.user, function(err, f){
		if (err) throw err;
		if (f) return next();
		else return res.json(401, {});
	});
}

exports.save = function(req, res){
	var data = req.param("data");
	var location = req.param("location");
    var wikipath = new WikiPath(location);

	wikiFS.writeWiki(wikipath, data, req.session.user, function(err){
		if(err) return res.json(500, err);
		res.json(200, { });
	});
}
