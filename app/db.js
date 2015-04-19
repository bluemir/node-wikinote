var Datastore = require("nedb");

var db = module.exports = {
	users : new Datastore({filename : "user.nedb", autoload : true}),
	backlinks : new Datastore({filename : "backlinks.nedb", autoload : true})
}

db.users.ensureIndex({fieldName : "id", unique : true});
db.backlinks.ensureIndex({fieldName : "path", unique : true});
