var express = require('express')
var http = require('http')
var path = require('path');
var flash = require("connect-flash");
var bodyParser = require("body-parser");
var multipart = require("connect-multiparty");
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var routes = require('./routes')

var app = express();

app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(favicon("public/icon/note_book.png"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(multipart());
app.use(cookieParser());
app.use(session({ secret: 'wikinote', resave : true, saveUninitialized : true}));
app.use(flash());

routes.init(app);

if ('development' == process.env.NODE_ENV || 'development') {
	app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
