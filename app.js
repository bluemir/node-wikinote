
/**
* Module dependencies.
*/

var express = require('express')
var routes = require('./routes')
var http = require('http')
var path = require('path');
var user = require('./routes/user.node.js');
var wikiapp = require("./routes/wiki.node.js");
var flash = require("connect-flash");

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 4000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon("public/icon/note_book.png"));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.cookieSession({ secret: 'wikinote'}));
	app.use(flash());
	app.use(wikiapp.preModule);
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
