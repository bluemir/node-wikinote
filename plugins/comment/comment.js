var https = require('https');
var config = require("./config");
var html = require("./html");

var wikinote;

exports.init = function(note){
	wikinote = note;
}

exports.render = function(wikipath, user, callback){
	var commentPath = wikipath.append(".comments");

	wikinote.readfile(commentPath, function(err, data){
		if(err && err.code != 'ENOENT') {
			return callback(err);
		}
		data = data || "";
		var comments = parseData(data);

		callback(null, html(comments, user));
	});
}

exports.write = function(req, res){
	var commentPath = req.wikipath.append(".comments");

	var contents = req.param("contents");
	var time = new Date().getTime();

	var author = req.user.id || req.param("author").trim();

	if(!author || author == "") {
		req.flash("warn", "Please login or put your name");
		res.redirect(req.wikipath);
		return;
	}
	if(config.recaptcha && (config.requestToUser || !req.user.isLogin())) {
		captchaVerify(req, function(err, result){
			if(err) {
				req.flash("warn", "something wrong with reCaptca");
				res.redirect(req.wikipath);
				return;
			}
			if(result) {
				appendComment();
			} else {
				req.flash("warn", "checkout captcha string");
				res.redirect(req.wikipath);
			}
		});
	} else {
		appendComment();
	}

	function appendComment(){
		wikinote.readfile(commentPath, function(err, data){
			if(err && err.code != 'ENOENT'){
				return callback(err);
			}

			data = data || "";
			data += "\x02" + time + ":" + author + ":" + contents + "\r\n\x03";

			wikinote.writefile(commentPath, data, req.user, function(){
				res.redirect(req.wikipath);
			});
		});
	}
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
