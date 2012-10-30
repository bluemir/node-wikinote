var fs = require("fs");
var markdown = require("markdown");
var config = require("../config.json");

exports.init = function(app){
  app.get(/^\/!public\/.*$/, publicfile);
  app.get(/^.*\.[^.\/]+$/, wikiApp.staticFiles);
  app.get(/^.*\/[^.\/]+$/, wikiGetRoute);
  app.post(/^.*\/[^.\/]+$/, wikiPostRoute);
}

var saveDir = config.wikiDir;

function wikiGetRoute(req, res){
  if("edit" in req.query){
    wikiApp.edit(req, res);
  } else if ("attach" in req.query){
    wikiApp.attach(req, res);
  } else if ("move" in req.query){
    //wikiApp.
  } else {
    wikiApp.view(req, res);
  }
}
function wikiPostRoute(req, res){
  if("edit" in req.query){
    wikiApp.save(req, res);
  } else if ("attach" in req.query){
    wikiApp.upload(req, res);
  }
}
function publicfile(req, res){
  res.sendfile(req.path.substring(2));
}
var wikiFS = {};

wikiFS.readWiki = function(path, callback){
  fs.readFile(saveDir + decodeURIComponent(path) + ".md", "utf8", function(err, data){
    if(err){
      callback(err);
      return;
    }
    callback(null, data);
  });
}
wikiFS.writeWiki = function(path, data, callback){
  fs.writeFile(saveDir + decodeURIComponent(path) + ".md", data, "utf8", function(err){
    callback(err);
  });
}
wikiFS.fileList = function(path, callback){
  fs.readdir(saveDir + decodeURIComponent(path), callback);
}
wikiFS.acceptFile  = function(srcPath, path, name, callback){
  fs.mkdir(saveDir + decodeURIComponent(path), function(){
    fs.rename(srcPath, saveDir + decodeURIComponent(path) + "/" + name, callback);
  });
}

var wikiApp = {};

wikiApp.view = function(req, res){
  var path  = req.path;
  wikiFS.readWiki(path, function(err, data){
    if(err) {
      data = null;
    } else {
      data = markdown.parse(data);
    }
    res.render("view", {title : "Personal Wiki", wikiData: data});
  });
}
wikiApp.edit = function(req, res){
  var path  = req.path;
  wikiFS.readWiki(path, function(err, data){
    res.render("edit", {title : "Personal Wiki::edit", wikiData: data});
  });
}
wikiApp.save = function(req, res){
  var path = req.path;
  var data = req.param("data");
  wikiFS.writeWiki(path, data, function(err){
    res.redirect(path); 
  });
}
wikiApp.attach = function(req, res){
  var path = req.path;
  wikiFS.fileList(path, function(err, files){
    res.render("attach", {title : "Personal Wiki::attach", files: files || []});
  });
}
wikiApp.upload = function(req, res){
  var file = req.files.upload;
  wikiFS.acceptFile(file.path, req.path, file.name, function(err){
    if(err) {console.log(err); res.send(500); return;}
    res.redirect(decodeURIComponent(req.path) + "?attach");
  });
}
wikiApp.staticFiles = function(req, res){
  res.sendfile(saveDir + decodeURIComponent(req.path));
}
