var path = require('path');

exports.comment = function(wikinote, callback){
	var commentPath = wikinote.path.append(".comments");

	wikinote.readFile(commentPath, function(err, data){
		if(err && err.code != 'ENOENT') {
			return callback(err);
		}
		data = data || "";
		var comments = parseData(data);

		callback(null, build(comments, wikinote.user));
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
function build(comments, user){
	return '<section id="comment">' + 
	'<style>@import url("/!plugins/comment/comment.css")</style>' + 
	'<form action="?comment" method="post">' +
		'<textarea name="contents" placeholder="leave a comment"></textarea>' +
		'<div id="comment-buttons">' +
		(user ? "" :'<input name="author" type="text" placeholder="name" maxlength="20"/>') +
		'<input type="submit" value="comment"/>' +
		'</div>' +
	'</form>' + 
	'<article>' +
		'<div class="author header">Name</div>' +
		'<div class="time header">Time</div>' +
		'<div class="contents header">Contents</div>' +
	'</article>' +
	comments.map(buildComment).reduce(concatComments, "") + 
	'</section>';

	function buildComment(comment){
		return '<article>' +
			'<div class="author">' + comment.commenter + "</div>" +
			'<div class="time">' + buildTime(comment.time) + "</div>" +
			'<div class="contents">' + comment.contents + "</div>" +
		"</article>";
	}
	function buildTime(time) {
		return '<span title="' + time + '">' + prettyDate(time) + '</span>';
	}
	function concatComments(pre, curr){
		return pre + curr;
	}
}
function prettyDate(date){
	var diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);

	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
		return;

	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
		
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
exports.assets = function(){
	return path.join(__dirname, "assets");
}
