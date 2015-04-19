var Q = require("q");
var url = require("url");
var markdown = require("./markdown");

var db = require("./db");

exports.get = function(wikipath){
	var defer = Q.defer();
	db.backlinks.findOne({path : wikipath.toString()}, function(err, doc){
		if(err){
			defer.reject(err);
		} else if(!doc){
			defer.resolve([]);
		} else {
			defer.resolve(doc.links);
		}
	});

	return defer.promise;
}
exports.update = function(wikipath, data){
	var from = wikipath.toString();
	var promise = markdown.links(data).map(resolveUrl).map(function(to){
		var defer = Q.defer()
		db.backlinks.update({path: to}, {$addToSet : { links : from}}, {upsert : true}, function(err){
			if(err){
				defer.reject(err);
			} else {
				defer.resolve();
			}
		});
		return defer.promise;
	});

	return Q(promise).all();

	function resolveUrl(path){
		return url.resolve(wikipath.toString(), path);
	}
}
exports.move = function(from, to){
	from = from.toString();
	to = to.toString();

	return Q.promise(function(resolve, reject){
		var defer = Q.defer();
		db.backlinks.update({links : from}, {$pull : {links : from}, $addToSet : {links : to}}, {multi : true}, function(err){
			if(err){
				reject(err);
			} else {
				resolve();
			}
		});
	}).then(function(){
		var defer = Q.defer();
		db.backlinks.update({path : from}, {$set : {path : to}}, function(err){
			if(err){
				defer.reject(err);
			} else {
				defer.resolve();
			}
		})
		return defer.promise;
	});
}
