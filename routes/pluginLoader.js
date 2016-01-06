var Q = require("q");
var express = require("express");
var wikiFS = require("../app/wikiFS");
var PREFIXS = ["", "../plugins/"];
var config = require("../config");

var plugins = config.plugins.map(load).filter(notNull);

var loader = new Loader();

plugins.forEach(function(plugin){
	plugin(loader.Interface);
});

exports.menus = function(){
	return loader.menus;
}

exports.actions = function(paramRouter){
	var actions = loader.actions;
	for(var name in actions.get){
		paramRouter.get(name, actions.get[name]);
	}
	for(var name in actions.post){
		paramRouter.post(name, actions.post[name]);
	}
}
exports.postArticle = function(wikipath, user){
	return Q.all(loader.postArticle.map(function(plugin){
		return Q.nfcall(plugin, wikipath, user);
	})).then(function(results){
		return results.reduce(function(prev, curr){
			return prev + curr;
		}, "");
	});
}

exports.assets = function(app){
	for(var name in loader.assets){
		app.use("/!plugins/" + name, express.static(loader.assets[name]));
	}
}

function load(name){
	for(var i = 0; i < PREFIXS.length; i++){
		try {
			return require(PREFIXS[i] + name);
		} catch(e) {
			continue;
		}
	}
	console.error("cannot find plugin ", name);
}
function notNull(e){
	return e !== null;
}

function Loader(){
	var postArticle = [];
	var actions = {
		get : [], post : []
	}
	var assets = [];
	var menus = [];

	this.Interface = {
		article : {
			pre : function(name, func){
				throw new Error("Not Implement");
			},
			post : function(func){
				postArticle.push(func);
			}
		},
		action : {
			get : function(name, func){
				actions.get[name] = func;
			},
			post : function(name, func){
				actions.post[name] = func;
			},
			menu : function(name){
				menus.push(name);
			}
		},
		assets : function(name, path){
			assets[name] = path;
		},
		readfile : function(path, callback){
			//TODO Check argument
			return wikiFS.readFile(path).nodeify(callback);
		},
		writefile : function(path, data, user, callback){
			//TODO Check argument
			return wikiFS.writeFile(path, data, user).nodeify(callback);
		},
		readwiki : function(path, callback){
			//TODO Check argument
			return wikiFS.readWiki(path).nodeify(callback);
		},
		writewiki : function(path, callback){
			//TODO Checkargument
			return wikiFS.writeWiki(path, data, user).nodeify(callback);
		}
	};
	this.postArticle = postArticle;
	this.actions = actions;
	this.assets = assets;
	this.menus = menus;
}
