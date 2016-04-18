var MarkdownIt = require("markdown-it");

var plugins = {
	footnote : require("markdown-it-footnote"),
	defineList : require('markdown-it-deflist'),
	externalLink : externalLink
}

var md = new MarkdownIt({
		html: true,
		linkify: true,
	})
	.use(plugins.footnote)
	.use(plugins.defineList)
	.use(externalLink)

exports.html = function(data){
	return md.render(data);
}

exports.links = function(data){
	var paresed_data = md.parse(data, {});
	return paresed_data.reduce(findlink, []);

	function findlink(result, curr){
		if(curr.children && curr.children instanceof Array){
			result = result.concat(curr.children.reduce(findlink, []));
		}

		if(curr.type == "link_open") {
			var url = getUrl(curr);
			if(!isExternalURL(url)){
				result = result.concat(url);
			}
		}
		return result;
	}
}

function externalLink(md, option){
	var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
		return self.renderToken(tokens, idx, options);
	};

	md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
		var url = getUrl(tokens[idx]);

		if(isExternalURL(url)){
			var aIndex = tokens[idx].attrIndex('target');

			if (aIndex < 0) {
				tokens[idx].attrPush(['target', '_blank']); // add new attribute
			} else {
				tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
			}
		}

		// pass token to default renderer.
		return defaultRender(tokens, idx, options, env, self);
	};
}
function getUrl(token){
	var hrefIndex = token.attrIndex('href');

	if (hrefIndex >= 0) {
		return token.attrs[hrefIndex][1];
	}
	return ""; //null object
}

var protocolRegexp = /^https?:\/\/.+$/;
function isExternalURL(url){
	return protocolRegexp.test(url);
}
