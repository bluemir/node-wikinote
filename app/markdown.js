var marked = require("marked");

var externalLinksRenderer = new marked.Renderer();
var protocolRegexp = /^https?:\/\/.+$/;
externalLinksRenderer.link = function(href, title, text){
	var external = protocolRegexp.test(href);
	return "<a href=\"" + href + "\"" +
		(external ? " target=\"_blank\"" : "")+
		(title ? " title=\"" + title + "\"" : "") +
		">" + text + "</a>";
}

marked.setOptions({
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	footnotes : true,
	renderer : externalLinksRenderer
});

exports.html = function(data){
	return marked(data);
}

var backlinksRenderer = new marked.Renderer();

exports.links = function(data){
	var links = [];
	backlinksRenderer.link = function(href, title, text) {
		if(!protocolRegexp.test(href)){
			links.push(href);
		}
		return marked.Renderer.prototype.link.apply(backlinksRenderer, arguments);
	};
	marked(data, {renderer : backlinksRenderer});
	return links;
}
