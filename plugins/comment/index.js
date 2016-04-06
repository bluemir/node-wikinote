var path = require("path");
var comment = require("./comment");

module.exports = function(wikinote, config){
	comment.init(wikinote);

	wikinote.article.post(comment.render)
	wikinote.action.post("comment", comment.write);
	wikinote.assets("comment", path.join(__dirname, "assets"));
}
