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

var protocolRegexp = /^https?:\/\/.+$/;
function externalLink(md, option){
	var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
		return self.renderToken(tokens, idx, options);
	};

	md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
		var token = tokens[idx];
		var hrefIndex = token.attrIndex('href');

		if (hrefIndex >= 0) {
			var url = token.attrs[hrefIndex][1];
			var isExternal = protocolRegexp.test(url);

			if(isExternal){
				// If you are sure other plugins can't add `target` - drop check below
				var aIndex = tokens[idx].attrIndex('target');

				if (aIndex < 0) {
					tokens[idx].attrPush(['target', '_blank']); // add new attribute
				} else {
					tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
				}
			}
		}

		// pass token to default renderer.
		return defaultRender(tokens, idx, options, env, self);
	};
}

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
			var token = curr;
			var hrefIndex = token.attrIndex('href');

			if (hrefIndex >= 0) {
				var url = token.attrs[hrefIndex][1];

				if(!protocolRegexp.test(url)){
					result = result.concat(url);
				}
			}
		}
		return result;
	}
}
