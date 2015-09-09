
WikinoteError.prototype = Object.create(Error.prototype);
function WikinoteError(message, code){
	Error.call(this, message);
	Error.captureStackTrace(this, WikinoteError);
	this.statusCode = code || 500;
}
WikinoteError.prototype.httpResponse = function(res){
	res.status(this.statusCode).render(this.errorPage || "error.html", this);
}
WikinoteError.prototype.jsonResponse = function(){
	res.status(this.statusCode).jsonp(this);
}

Unauthorized.prototype = Object.create(WikinoteError.prototype);
function Unauthorized(){
	WikinoteError.call(this, "unauthorized", 401);
	this.errorPage = "noAuth.html";
}

function handle(err){
	// Pass-through
	if (err instanceof WikinoteError) {
		return err;
	}
	// Type-cast
	var e = Object.create(WikinoteError.prototype);
	e.stack = err.stack;
	e.statusCode = 500;
	return e;
}

module.exports = {
	handle : handle,
	WikinoteError: WikinoteError,
	Unauthorized: Unauthorized,
}
