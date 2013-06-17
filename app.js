
/**
* Module dependencies.
*/

var express = require('express')
	, routes = require('./routes')
	, http = require('http')
	, path = require('path');

var wikiapp = require("./routes/wiki.node.js");

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 4000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon("public/icon/note_book.png"));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(function(req, res, next){
		res.locals.path = req.path;
		res.locals.bread = req.path.split("/").slice(1);
		res.locals.notename = decodeURIComponent(res.locals.bread[res.locals.bread.length - 1]); 
		next();
	});
	app.use(app.router);
	//app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

wikiapp.init(app);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
