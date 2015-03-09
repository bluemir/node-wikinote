var path = require("path");
var fs = require("fs");
var config = require("./config.js");

module.exports = function(wikinote){

	var html = fs.readFileSync(path.join(__dirname, "disqus.html"), "utf8").replace(/%disqus_shortname%/, config.disqus_shortname);

	wikinote.article.post(function(wikipath, user, callback){
		callback(null, html);
	});
}
