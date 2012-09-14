var fs = require("fs");
var markdown = require("markdown");

exports.onRequest = function(req, res){
	new wikiapp(req, res);
};

exports.onPost = function(req, res) {
	if(req.param("action") === "attach")
	{
		var uploadFileInfo = req.files.upload;
		fs.rename(uploadFileInfo.path, "data" + decodeURIComponent(req.path) + "/" +  uploadFileInfo.name, function(err){
			if(err) throw err;
			res.redirect(decodeURIComponent(req.path) + "?action=attach");
		});
	}
	else
	{
		fs.writeFile("data" + decodeURIComponent(req.path) + ".md", req.param("contents"), "utf8", function(err){
			if(err) throw err;
			res.redirect(req.path);
		});
		fs.mkdir("data" + decodeURIComponent(req.path));
	}
};

exports.staticFiles = function(req, res){
	res.sendfile("data" + decodeURIComponent(req.path));
};

function wikiapp(req, res){
	this.res = res;
	this.req = req;
	this.data;

	this.handleAction();
}
wikiapp.prototype.handleAction = function(){
	switch(this.req.query.action){
		case "edit" :
			this.onEdit();
			break;
		case "attach":
			this.onAttach();
			break;
		case "delete" : 
			//this.onDelete();
		default :
			this.onView();
	}
}
wikiapp.prototype.onView = function(){
	var that = this;
	this.loadWikiData(function(err, data){
		if(err)
		{
			that.res.render("noview",{title : "Personal Wiki", path : decodeURIComponent(that.req.path)});
		}
		else
		{
			data = markdown.parse(data);
			that.res.render("view", {
				title : "Personal Wiki", 
				wikidata : data,
				path : decodeURIComponent(that.req.path)
			});
		}
	});
}
wikiapp.prototype.onEdit = function(){
	var that = this;
	this.loadWikiData(function(err, wikidata){
		if(err)
		{
			that.res.render("edit", {
				title: "personal wiki",
				path : decodeURIComponent(that.req.path),
				wikidata : ""
			});
		}
		else
		{
			that.res.render("edit", {
				title: "personal wiki",
				path : decodeURIComponent(that.req.path),
				wikidata : wikidata 
			});
		}
	});
}
wikiapp.prototype.onAttach = function(data){
	var that = this;
	fs.readdir("data" + decodeURIComponent(this.req.path), function(err, files) {
		if(err) throw err;
		else
		{
			that.res.render("attach", {
				title : "personal wiki",
				path : decodeURIComponent(that.req.path),
				files : files,
			});
		}
	});
}
wikiapp.prototype.loadWikiData = function(callback){
	fs.readFile("data" + decodeURIComponent(this.req.path) + ".md", "utf8", callback);
};

