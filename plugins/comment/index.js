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

exports.onComment = function(wikinote){
	var commentPath = wikinote.path.append(".comments");

	var contents = wikinote.param("contents");
	var time = new Date().getTime();
	var author = wikinote.user ? wikinote.user.id : wikinote.param("author").trim();

	if(!author || author == ""){
		wikinote.flash("warn", "Please login or write down your name");
		wikinote.redirect(wikinote.path);

		return;
	}
	if(config.recaptcha && (config.requestToUser || !wikinote.user)){
		captchaVerify(wikinote, function(err, result){
			if(err) {
				wikinote.flash("warn", "something wrong with reCaptca");
				wikinote.redirect(wikinote.path);
				return;
			}
			if(result) {
				appendComment();
			} else {
				wikinote.flash("warn", "checkout captcha string");
				wikinote.redirect(wikinote.path);
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

			wikinote.writeFile(commentPath, data, function(){
				wikinote.redirect(wikinote.path);
			});
		});
	}
}
function captchaVerify(wikinote, callback){
	var reqData = "";
	reqData += "privatekey=" + config.recaptcha.privateKey + "&";
	reqData += "remoteip=" + wikinote._.req.ip + "&";
	reqData += "challenge=" + wikinote.param("recaptcha_challenge_field") + "&";
	reqData += "response=" + wikinote.param("recaptcha_response_field");

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
