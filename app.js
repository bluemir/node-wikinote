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

var Duplex = require('stream').Duplex;
var sharejs = require('share');
var browserChannel = require('browserchannel').server;
var livedb = require('livedb');

var backend = livedb.client(livedb.memory());
var share = sharejs.server.createClient({backend: backend});

var routes = require('./routes');
var config = require("./config")

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
app.use("/!public/lib/share", express.static(sharejs.scriptsDir));

app.use("/!public", browserChannel(function (client) {
	var stream = new Duplex({objectMode: true});
	stream._write = function (chunk, encoding, callback) {
		if (client.state !== 'closed') {
			client.send(chunk);
		}
		callback();
	};
	stream._read = function () {
	};
	stream.headers = client.headers;
	stream.remoteAddress = stream.address;
	client.on('message', function (data) {
		stream.push(data);
	});
	stream.on('error', function (msg) {
		client.stop();
	});
	client.on('close', function (reason) {
		stream.emit('close');
		stream.emit('end');
		stream.end();
	});
	return share.listen(stream);
}));

routes.init(app);

if ('development' == process.env.NODE_ENV || 'development') {
	app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
