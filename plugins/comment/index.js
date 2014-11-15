var config = require("./config");
var https = require('https');
var path = require('path');

var html = require('./html');

exports.comment = function(wikinote, callback){
	var commentPath = wikinote.path.append(".comments");

	wikinote.readFile(commentPath, function(err, data){
		if(err && err.code != 'ENOENT') {
			return callback(err);
		}
		data = data || "";
		var comments = parseData(data);

		callback(null, html(comments, wikinote.user));
	});
}

function parseData(data){
	var lines = data.split(/\x03/);
	
	return lines.map(function(line){
		//time:commenter:body
		var index = line.indexOf(":");
		var index2 = line.indexOf(":", index + 1);

		if(index == -1 || index2 == -1) return null;

		return {
			time : new Date(line.substr(1, index - 1) -0), //ignore \x02
			commenter : line.substr(index + 1, index2 - index - 1),
			contents : line.substr(index2 + 1)
		}
	}).filter(function(e){return e !== null});
}

exports.writeComment = function(wikinote){
	return function(req, res){
		var note = wikinote(req, res);
		
		var commentPath = note.path.append(".comments");

		var contents = req.param("contents");
		var time = new Date().getTime();
		var author = note.user ? note.user.id : req.param("author").trim();

		if(!author || author == "") {
			req.flash("warn", "Please login or write down your name");
			res.redirect(note.path);
			return;
		}
		if(config.recaptcha && (config.requestToUser || !note.user)){
			captchaVerify(req, function(err, result){
				if(err) {
					req.flash("warn", "something wrong with reCaptca");
					res.redirect(note.path);
					return;
				}
				if(result) {
					appendComment();
				} else {
					req.flash("warn", "checkout captcha string");
					res.redirect(note.path);
				}
			});
		} else {
			appendComment();
		}

		function appendComment(){
			wikinote.readFile(commentPath, function(err, data){
				if(err && err.code != 'ENOENT'){
					return callback(err);
				}

				data = data || "";
				data += "\x02" + time + ":" + author + ":" + contents + "\r\n\x03";

				wikinote.writeFile(commentPath, data, note.user, function(){
					res.redirect(note.path);
				});
			});
		}
	}
}

function captchaVerify(_req, callback){
	var reqData = "";
	reqData += "privatekey=" + config.recaptcha.privateKey + "&";
	reqData += "remoteip=" + _req.ip + "&";
	reqData += "challenge=" + _req.param("recaptcha_challenge_field") + "&";
	reqData += "response=" + _req.param("recaptcha_response_field");

	var req = https.request({
		host : "www.google.com",
		path : "/recaptcha/api/verify",
		method : "POST",
		headers : {
			"Content-Type" : "application/x-www-form-urlencoded",
			"Content-Length" : reqData.length
		}
	}, function(res){
		res.setEncoding('utf8');
		var str = "";
		res.on("data", function(data){
			str += data;
		}).on("end", function(){
			if(/^true/.test(str)){
				callback(null, true);
			} else {
				callback(null, false);
			}
		});
	}).on('error', function(e){
		callback(e);
	});
	req.write(reqData);
	req.end();
}
exports.assets = function(){
	return path.join(__dirname, "assets");
}
