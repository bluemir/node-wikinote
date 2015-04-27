var Duplex = require('stream').Duplex;
var sharejs = require('share');
var browserChannel = require('browserchannel').server;
var livedb = require('livedb');

var backend = livedb.client(livedb.memory());
var share = sharejs.server.createClient({backend: backend});

var users = {};
var noop = function(){};

function attech(name, id){
	if(!users[name]){
		users[name] = {};
	}

	users[name][id] = 1;
}
function detech(name, id){
	delete users[name][id];
}
function isThere(name){
	return Object.keys(users[name]).length != 0;
}

exports.static = sharejs.scriptsDir;
exports.middleware = browserChannel(function (client) {
	var stream = new Duplex({objectMode: true});
	var docName = null;
	var agent = null;
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

	stream.on('error', function (msg) {
		client.stop();
	});

	client.on('message', function (data) {
		stream.push(data);
		if(data.a == "sub"){
			docName = data.d;
		}
	});

	client.on('close', function(reason) {
		agent.trigger("disconnect", "wiki", docName, noop)

		stream.push(null);
		stream.emit('close');
	});

	stream.on('end', function() {
		client.close();
	});
	return agent = share.listen(stream);
});

share.use(function (req, next){
	switch(req.action) {
		case "subscribe" :
			//console.log("subscribe", req.docName, req.agent.sessionId);
			attech(req.docName, req.agent.sessionId);
			return;
		case "disconnect":
			//console.log("disconnect", req.docName, req.agent.sessionId);
			detech(req.docName, req.agent.sessionId);
			if(!isThere(req.docName)){
				req.agent.submit(req.collection, req.docName, {del : true}, noop);
				console.log("delete", req.docName);
			}
			return;
	}
	next();
});
