var fs = require("fs");
var config = require("../config.json");

var saveDir = config.wikiDir;

exports.readWiki = function(path, callback){
  fs.readFile(saveDir + path + ".md", "utf8", function(err, data){
    if(err){
      callback(err);
      return;
    }
    callback(null, data);
  });
}
exports.writeWiki = function(path, data, callback){
  var dirPath = getDir(path);
  readyDir(dirPath, function (){
    fs.writeFile(saveDir + path  + ".md", data, "utf8", function(err){
      callback(err);
    });
  })
}
exports.fileList = function(path, callback){
  fs.readdir(saveDir + path, callback);
}
exports.acceptFile  = function(srcPath, path, name, callback){
  readyDir(path, function(){
    fs.readFile(srcPath, function(e, data){
      if(e) return callback(e);
      fs.writeFile(saveDir + path + "/" + name, data, callback);
    });
  });
}
exports.deleteFile = function(path, callback){
  
}
exports.move = function(srcPath, targetPath, callback){
  readyDir(getDir(targetPath), function(e){
    fs.rename(saveDir + srcPath, saveDir + targetPath,function(e){
      console.log(e);
    });
    fs.rename(saveDir + srcPath + ".md", saveDir + targetPath + ".md",function(e){
      console.log(e);
      callback(null);
    });
  });
}
function getDir(path){
  var index = path.lastIndexOf("/");
  if(index == path.length - 1)
    index = path.lastIndexOf("/", index - 1);  
  return index == 0 ? "/" : path.substr(0, index);
}
function readyDir(path, callback){
  fs.mkdir(saveDir + path, callback);
}