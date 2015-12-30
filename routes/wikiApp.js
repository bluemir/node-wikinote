var Q = require("q");
var wikiFS = require("../app/wikiFS");
var markdown = require("../app/markdown");
var WikiPath = require("./wikipath");
var config = require("../config");
var userApp = require("./userApp");
var loader = require("./pluginLoader");

var wikiApp = {};

wikiApp.view = function(req, res){
	Q.all([
		wikiFS.readWiki(req.wikipath),
		loader.postArticle(req.wikipath, req.user)
	]).spread(function(data, plugin){
		var html = markdown.html(data);
		res.render("view", {wikiData: html, pluginsData : plugin});
	}).fail(function(err){
		data = null;
		res.status(404).render("view", {wikiData: data, pluginsData : ""});
	});
}
wikiApp.edit = function(req, res){
	wikiFS.readWiki(req.wikipath).then(function(data){
		res.render("edit", {wikiData: data});
	}).fail(function(err){
		//TODO Error Handling
		res.render("edit", {wikiData: null});
	})
}
wikiApp.save = function(req, res){
	var data = req.body.data;

	wikiFS.writeWiki(req.wikipath, data, req.user).then(function(){
		res.redirect(303, req.path);
	}).fail(function(err){
		console.log(err);
		req.flash("warn", "fail to save");
		res.redirect(303, req.path);
	});
}
wikiApp.moveForm = function(req, res){
	res.render("move", {});
}
wikiApp.move = function(req, res){
	var target = req.body.target;

	if(!/^\//.test(target)){
		target = "/" + target;
	}

	wikiFS.move(req.wikipath, new WikiPath(target)).then(function(){
		res.redirect(303, target);
	}).fail(function(err){
		req.flash("warn", "move fail");
		res.redirect(303, req.wikipath);
	});
}
wikiApp.attach = function(req, res){
	wikiFS.fileList(req.wikipath).then(function(files){
		res.render("attach", {files: files});
	}, function(err){
		res.render("attach", {files: []});
	});
}
wikiApp.upload = function(req, res){
	var file = req.files.upload;
	wikiFS.acceptFile(file.path, req.wikipath, file.name).then(function(){
		res.redirect(303, req.path + "?attach");
	}).fail(function(err){
		res.send(500);
	});
}
wikiApp.staticFiles = function(req, res){
	res.sendfile(saveDir + decodeURIComponent(req.path));
}

wikiApp.search = function(req, res){
	var word = req.query.q;
	var c = req.query.case || false;
	var flags = "";
	flags += req.query.case ?  "" : "i";

	if(!word){
		res.render("search", {result : null, sensitive: c});
		return;
	}
	wikiFS.find(word, flags, "").then(function(data){
		res.render("search", {result :data, word : word, sensitive : c});
	}).fail(function(e){
		res.status(500).end();
	});
}
wikiApp.deleteForm = function(req, res){
	res.render("delete", {});
}
wikiApp.deleteConfirm = function(req, res){
	if(req.wikipath.name != req.body.confirm){
		req.flash("warn","note의 이름이 정확하지 않습니다.");
		res.redirect(303, req.wikipath + "?delete" );
		return;
	}
	wikiFS.deleteWiki(req.wikipath).then(function(){
		req.flash("info", "delete!");
		res.redirect(303, "/" + config.frontPage);
	}).fail(function(e){
		req.flash("warn","fail to delete");
		res.redirect(303, req.wikipath);
	});
}
wikiApp.history = function(req, res){
	wikiFS.history(req.wikipath).then(function(logs){
		res.render("history", {logs : logs});
	}).fail(function(){
		res.render("history", {logs : []});
	});
}
wikiApp.backlinks = function(req, res){
	wikiFS.backlinks(req.wikipath).then(function(links){
		res.render("backlinks", {backlinks: links});
	});
}
module.exports = wikiApp;
