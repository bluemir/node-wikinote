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
	var scriptUrl = "http://www.google.com/recaptcha/api/challenge?k=" + config.recaptcha.publicKey;
	var noscriptUrl = "http://www.google.com/recaptcha/api/noscript?k=" + config.recaptcha.privateKey;
	return '<div id="captcha">' +
		'<script type="text/javascript">var RecaptchaOptions = { theme : "clean" };</script>' +
		'<script type="text/javascript" src="' + scriptUrl + '"></script>' +
		'<noscript>' +
			'<iframe src="' + noscriptUrl + '" height="300" width="500" frameborder="0"></iframe><br>' +
			'<textarea name="recaptcha_challenge_field" rows="3" cols="40"></textarea>' +
			'<input type="hidden" name="recaptcha_response_field" value="manual_challenge">' +
		'</noscript>' +
	'</div>';
}
