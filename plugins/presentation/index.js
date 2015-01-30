var express = require("express");
var swig = require("swig");
var path = require("path");

module.exports = function(wikinote){

	var app = express();

	app.engine("html", swig.renderFile)

	app.set('views', __dirname);
	app.set('view engine', 'html');

	app.get("*", function(req, res) {
		wikinote.readwiki(req.wikipath, function(err, data){
			var option = {};
			try {
				option = JSON.parse(data.match(/^<!--({.*})-->/)[1]);
			} catch (e){
			}
			res.render("presentation", {title : "Wiki Note::Presentation", wikidata: data, option : option});
		});
	});

	wikinote.action.get("presentation", app);
	wikinote.action.menu("presentation");

	wikinote.assets("presentation", path.join(__dirname, "assets"));
}
