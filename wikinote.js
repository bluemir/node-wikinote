#!/usr/bin/env node

require("./config").$init();

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
var swig = require("swig-templates");

var routes = require('./routes');

var app = express();

app.engine("html", swig.renderFile)

app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(favicon(__dirname + "/public/icon/note_book.png"));
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

module.exports = app;

