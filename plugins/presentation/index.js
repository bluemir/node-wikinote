var express = require("express");
var swig = require("swig");

module.exports = function(wikinote){
	var app = express();
	
	app.engine("html", swig.renderFile)

	app.set('views', __dirname);
	app.set('view engine', 'html');

	app.get("*", function(req, res) {
		var note = wikinote(req, res);
		wikinote.readWiki(note.path, function(err, data){
			var option = {};
			try {
				option = JSON.parse(data.match(/^<!--({.*})-->/)[1]);
			} catch (e){
			}
			res.render("presentation", {title : "Wiki Note::Presentation", wikidata: data, option : option});
		});
	});
	return app;
}


