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
var swig = require("swig");

var share = require("./routes/share");

var routes = require('./routes');
var config = require("./config");

var app = express();
app.engine("html", swig.renderFile)

app.set('port', process.env.PORT || config.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(favicon("public/icon/note_book.png"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(multipart());
app.use(cookieParser());
app.use(session({ secret: 'wikinote', resave : true, saveUninitialized : true}));
app.use(flash());

app.use("/!public", express.static(__dirname + "/public"));
app.use("/!public/lib/share", express.static(share.static));
app.use("/!public/lib/marked.min.js", express.static("node_modules/marked/marked.min.js"));
app.use("/!public/lib/font-awesome", express.static("node_modules/font-awesome"));

app.use("/!public/lib", share.middleware);

routes.init(app);

if ('development' == process.env.NODE_ENV || 'development') {
	app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
