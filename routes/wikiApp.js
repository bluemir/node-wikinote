var wikiFS = require("../app/wikiFS");
var marked = require("marked");
var WikiPath = require("./wikipath");
var config = require("../config");
var userApp = require("./userApp");
var loader = require("./pluginLoader");

var customRender = new marked.Renderer();
var protocolRegexp = /^https?:\/\/.+$/;
customRender.link = function(href, title, text){
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
	renderer : customRender
});

var wikiApp = {};

wikiApp.view = function(req, res){
	wikiFS.readWiki(req.wikipath, function(err, data){
		if(err) {
			res.status(404);
			data = null;
		} else {
			data = marked(data);
		}
		loader.postArticle(req.wikipath, req.user, function(err, html){
			res.render("view", {wikiData: data, pluginsData : html});
		});
	});
}
wikiApp.edit = function(req, res){
	wikiFS.readWiki(req.wikipath, function(err, data){
		res.render("edit", {wikiData: data});
	});
}
wikiApp.save = function(req, res){
	var data = req.param("data");
	wikiFS.writeWiki(req.wikipath, data, req.session.user, function(err){
		res.redirect(req.path);
	});
}
wikiApp.moveForm = function(req, res){
	res.render("move", {});
}
wikiApp.move = function(req, res){
	wikiFS.move(req.wikipath, new WikiPath(req.param("target")), function(){
		res.redirect(req.param("target"));
	});
}
wikiApp.attach = function(req, res){
	wikiFS.fileList(req.wikipath, function(err, files){
		res.render("attach", {files: files || []});
	});
}
wikiApp.upload = function(req, res){
	var file = req.files.upload;
	wikiFS.acceptFile(file.path, req.wikipath, file.name, function(err){
		if(err) {console.log(err); res.send(500); return;}
		res.redirect(req.path + "?attach");
	});
}
wikiApp.staticFiles = function(req, res){
	res.sendfile(saveDir + decodeURIComponent(req.path));
}
wikiApp.presentation = function(req, res){
	wikiFS.readWiki(req.wikipath, function(err, data){
		var option = {};
		try {
			option = JSON.parse(data.match(/^<!--({.*})-->/)[1]);
		} catch (e){
		}
		res.render("presentation", {wikiData: data, option : option});
	});
}

wikiApp.search = function(req, res){
	var word = req.param("q");
	if(!word){
		res.render("search", {result : null});
		return;
	}
	wikiFS.find("", word, function(e, data){
		res.render("search", {result :data, word : word});
	});

}
wikiApp.deleteForm = function(req, res){
	res.render("delete", {});
}
wikiApp.deleteConfirm = function(req, res){
	if(req.wikipath.name != req.param("confirm")){
		req.flash("warn","note의 이름이 정확하지 않습니다.");
		res.redirect(req.wikipath + "?delete" );
		return;
	}
	wikiFS.deleteFile(req.wikipath, function(e){
		if(e) {
			console.log(e);
			req.flash("warn","fail to delete");
			res.redirect(req.wikipath);
		} else {
			req.flash("info", "delete!");
			res.redirect("/" + config.frontPage);
		}
	});
}
wikiApp.history = function(req, res){
	wikiFS.history(req.wikipath, function(e, logs){
		res.render("history", {logs : logs});
	});
}
module.exports = wikiApp;
