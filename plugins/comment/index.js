var path = require("path");
var comment = require("./comment");

module.exports = function(wikinote, config){
	var plugin = comment.init(wikinote, config);

	wikinote.article.post(plugin.render)
	wikinote.action.post("comment", plugin.write);
	wikinote.assets("comment", path.join(__dirname, "assets"));
}
