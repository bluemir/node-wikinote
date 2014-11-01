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
var routes = require('./routes');
var swig = require("swig");

var app = express();
app.engine("html", swig.renderFile)

app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(favicon("public/icon/note_book.png"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(multipart());
app.use(cookieParser());
app.use(session({ secret: 'wikinote', resave : true, saveUninitialized : true}));
app.use(flash());

app.use("/!public", express.static(__dirname + "/public"));

routes.init(app);

if ('development' == process.env.NODE_ENV || 'development') {
	app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
