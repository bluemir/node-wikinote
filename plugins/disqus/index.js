var path = require("path");
var fs = require("fs");

module.exports = function(wikinote, config){
	var html = fs.readFileSync(path.join(__dirname, "disqus.html"), "utf8").replace(/%disqus_shortname%/, config.shortname);

	wikinote.article.post(function(wikipath, user, callback){
		callback(null, html);
	});
}
