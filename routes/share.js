var ShareDB = require('sharedb');
var ottext = require('ot-text');

var wikiFS = require("../app/wikiFS");
var WikiPath = require("../app/wikipath");

ShareDB.types.register(ottext.type);

var share = new ShareDB({
	//db: ShareDB.MemoryDB,
	//pubsub: ShareDB.MemoryPubSub
});

var WebSocketJSONStream = require('websocket-json-stream');

var browserify = require('browserify');
var b = browserify();

b.require("sharedb/lib/client", {expose: "share"});
b.require("ot-text", {expose:"ot-text"});

// make browerify buffer
exports.static = function(req, res) {
	b.bundle().pipe(res);
}

exports.ws = function(ws, req) {
	var path = req.params[0];

	var conn = share.connect();
	var doc = conn.get("wiki", path);

	var stream = new WebSocketJSONStream(ws);
	doc.fetch(function(err) {
		if (err) throw err;
		if (doc.type === null) {
			var wikipath = WikiPath.decode("/" + path)
			wikiFS.readWiki(wikipath).then(function(data){
				doc.create(data, 'text', function(){
					console.log("created : ", doc.id);
					setTimer(doc.id);
					share.listen(stream);
				});
			}).fail(function(err){
				console.error(err)
			});
		} else {
			console.log("ready : ", doc.id);
			share.listen(stream);
		}
	});
}

// timeout...
var timers = {};
function setTimer(docName){
	console.log("set timer for " + docName);
	clearTimeout(timers[docName]);
	timers[docName] = setTimeout(function(){
		console.log("timeout!");
		var conn = share.connect();
		var doc = conn.get("wiki", docName);
		doc.fetch(function(){
			doc.del(function(){
				console.log(docName + " Deleted!", arguments);
			});
		});
	//TODO config for timeout
	}, 10 * 60 * 1000); // 10m
}

share.use("receive", function(req, cb){
	if(req.agent.subscribedDocs.wiki)
		Object.keys(req.agent.subscribedDocs.wiki).forEach(setTimer);
	cb();
});




