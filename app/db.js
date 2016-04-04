var Datastore = require("nedb");
var path = require("path");

config.wikinotePath
var db = module.exports = {
	users : new Datastore({
		filename : path.join(config.wikinotePath, ".app", "user.nedb"),
		autoload : true
	}),
	backlinks : new Datastore({
		filename : path.join(config.wikinotePath, ".app", "backlinks.nedb"),
		autoload : true
	})
}

db.users.ensureIndex({fieldName : "id", unique : true});
db.backlinks.ensureIndex({fieldName : "path", unique : true});
