var fs = require("fs");
var markdown = require("markdown");
var config = require("../config.json");

exports.init = function(app){
  //app.get("!list", listAll);
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
    wikiApp.moveForm(req, res);
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
  //TODO 만약 폴더가 없으면 만드는 기능이 있어야 한다.
  var decodedPath  = decodeURIComponent(path);
  decodedPath.substr(0, decodedPath.lastIndexOf("/"));//TODO 올바르게 작동하는 지 확인 할것 
  fs.mkdir(saveDir + decodedPath.substr(0, decodedPath.lastIndexOf("/")), function (){
    fs.writeFile(saveDir + decodedPath  + ".md", data, "utf8", function(err){
      callback(err);
    });
  })
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
      console.log(err);
      data = null;
    } else {
      data = markdown.parse(data);
    }
    res.render("view", {title : "Wiki Note", wikiData: data});
  });
}
wikiApp.edit = function(req, res){
  var path  = req.path;
  wikiFS.readWiki(path, function(err, data){
    res.render("edit", {title : "Wiki Note::edit", wikiData: data});
  });
}
wikiApp.save = function(req, res){
  var path = req.path;
  var data = req.param("data");
  wikiFS.writeWiki(path, data, function(err){
    res.redirect(path); 
  });
}
wikiApp.moveForm = function(req, res){
  res.render("move", {title : "Wiki Note::move"});
}
wikiApp.attach = function(req, res){
  var path = req.path;
  wikiFS.fileList(path, function(err, files){
    res.render("attach", {title : "Wiki Note::attach", files: files || []});
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
