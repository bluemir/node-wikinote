var config = require("./config");
var moment = require("moment");

module.exports = function(comments, user){
	return '<section id="comment">' +
	'<style>@import url("/!plugins/comment/comment.css")</style>' +
	'<header>' + comments.length + ' Comments</header>' +
	'<form action="?comment" method="post">' +
		'<textarea name="contents" placeholder="leave a comment"></textarea>' +
		(config.requestToUser || !user.isLogin() ? captcha() : "") +
		'<div id="comment-buttons">' +
		(user.isLogin() ? "" :'<input name="author" type="text" placeholder="name" maxlength="20"/>') +
		'<input type="submit" value="comment"/>' +
		'</div>' +
	'</form>' +
	comments.map(buildComment).reduce(concatComments, "") +
	'</section>';
}
function buildComment(comment){
	return '<article>' +
		'<div class="author">' + comment.commenter + "</div>" +
		'<div class="time">' + buildTime(comment.time) + "</div>" +
		'<div class="contents">' + comment.contents + "</div>" +
	"</article>";
}
function buildTime(time) {
	return '<span title="' + moment(time).format('LLL') + '">' + moment(time).fromNow() + '</span>';
}
function concatComments(pre, curr){
	return pre + curr;
}
function captcha(){
	if(!config.recaptcha) {
		return "";
	}

	return '<script src="https://www.google.com/recaptcha/api.js" async defer></script>' +
		'<div id="captcha" class="g-recaptcha" data-sitekey="'+ config.recaptcha.publicKey+'"></div>' +
		'<noscript>'+
			'<div style="width: 302px; height: 352px;">' +
				'<div style="width: 302px; height: 352px; position: relative;">'+
					'<div style="width: 302px; height: 352px; position: absolute;">'+
						'<iframe src="https://www.google.com/recaptcha/api/fallback?k='+config.recaptcha.publicKey+'" frameborder="0" scrolling="no" style="width: 302px; height:352px; border-style: none;">'+
						'</iframe>'+
					'</div>'+
					'<div style="width: 250px; height: 80px; position: absolute; border-style: none; '+
						'bottom: 21px; left: 25px; margin: 0px; padding: 0px; right: 25px;">'+
						'<textarea id="g-recaptcha-response" name="g-recaptcha-response" '+
							'class="g-recaptcha-response" '+
							'style="width: 250px; height: 80px; border: 1px solid #c1c1c1;'+
							'margin: 0px; padding: 0px; resize: none;" value="">'+
						'</textarea>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</noscript>';
}
