var path = require("path");
var fs = require("fs");

module.exports = function(wikinote, config){

	var html = fs.readFileSync(path.join(__dirname, "remark.html"), "utf8");

	wikinote.action.get("presentation", function(req, res){
		wikinote.readwiki(req.wikipath, function(err, data){

			res.send(render(html, {
				wikidata : data,
				wikiname : req.wikipath.name
			}));
		});
	})
	wikinote.action.menu("presentation");

	wikinote.assets("remark", path.join(__dirname, "assets"));
}
function render(html, data) {
	for(var key in data){
		html = html.replace("%"+key+"%", data[key]);
	}
	return html;
}
