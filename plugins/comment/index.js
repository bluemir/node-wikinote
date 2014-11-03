exports.comment = function(wikinote, callback){
	var commentPath = wikinote.path.append(".comments");

	wikinote.readFile(commentPath, function(err, data){
		if(err && err.code != 'ENOENT') {
			return callback(err);
		}
		data = data || "";
		var comments = parseData(data);

		callback(null, build(comments));
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
			time : line.substr(1, index - 1), //ignore \x02
			commenter : line.substr(index + 1, index2 - index - 1),
			contents : line.substr(index2 + 1)
		}
	}).filter(function(e){return e !== null});
}
function build(comments){
	return comments.map(buildComment).reduce(concatComments, "") + 
	'<form action="?comment" method="post">' +
		'<input name="contents" type="text"/>' +
		'<input name="author" type="text"/>' +
		'<input type="submit" value="comment"/>' +
	'</form>';

	function buildComment(comment){
		return "<p>" +
			"<span>" + new Date(comment.time - 0 ) + "</span>/" +
			"<span>" + comment.commenter + "</span>/" +
			"<span>" + comment.contents + "</span>" +
		"</p>";
	}
	function concatComments(pre, curr){
		return pre + curr;
	}
}

exports.onComment = function(wikinote){
	var commentPath = wikinote.path.append(".comments");

	var contents = wikinote.param("contents");
	var time = new Date().getTime();
	var author = wikinote.user ? wikinote.user.id : wikinote.param("author");

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
