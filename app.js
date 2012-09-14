
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , wiki = require("./routes/wiki")
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  //app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
	res.redirect("/FrontPage");
});
app.get(/^\/!public\/.*$/, function(req, res){
	res.sendfile(req.path.substring(2));
});
app.get(/^.*\/[^.\/]+(\.[^.\/]+)+$/, wiki.staticFiles);
app.get(/^.*\/[^.\/]+$/, wiki.onRequest);

app.post(/^.*\/[^.\/]+$/, wiki.onPost);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
