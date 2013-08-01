var config = require("../config.json");

var wikiApp = require("./wikiApp.node.js")

var Path = require("./path.node.js");

exports.init = function(app){
	//app.get("!list", listAll);
	app.get("/", redirectToFront);
	app.get(/^\/!public\/.*$/, publicFile);
	app.get(/^.*\.[^.\/]+$/, staticFile);
	app.get(/^.*\/[^.\/]+$/, wikiGetRoute);
	app.post(/^.*\/[^.\/]+$/, wikiPostRoute);
}

exports.preModule = function(req, res, next){
	req.wikiPath = new Path(req.path);
	res.locals.path = req.path;
	res.locals.bread = req.wikiPath.toArray();
	res.locals.notename = req.wikiPath.name;
	next();
}

var saveDir = config.wikiDir;

function redirectToFront(req, res){
	if("find" in req.query){
		wikiApp.find(req, res);
	} else {
		res.redirect("/" + config.frontPage);
	}
}
function wikiGetRoute(req, res){
	if("edit" in req.query){
		wikiApp.edit(req, res);
	} else if ("attach" in req.query){
		wikiApp.attach(req, res);
	} else if ("move" in req.query){
		wikiApp.moveForm(req, res);
	} else if ("presentation" in req.query){
		wikiApp.presentation(req, res);
	} else if("find" in req.query){
		wikiApp.find(req, res);
	} else {
		wikiApp.view(req, res);
	}
}
function wikiPostRoute(req, res){
	if("edit" in req.query){
		wikiApp.save(req, res);
	} else if ("attach" in req.query){
		wikiApp.upload(req, res);
	} else if ("move" in req.query){
		wikiApp.move(req, res);
	}
}
function publicFile(req, res){
	res.sendfile(req.path.substring(2));
}
function staticFile(req, res){
	res.sendfile(saveDir + decodeURIComponent(req.path));
}