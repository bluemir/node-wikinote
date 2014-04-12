var fs = require("fs");
var env = process.env;

var defaultValue = {
	frontPage : "FrontPage",
	wikiDir : "~/wiki",
	autoBackup : false,
	wikiname : "WikiNote"
}

apply(resolve(load()));

function load(){
	var config = require("../config.json");
	for(var name in defaultValue){
		if(!config[name]){
			config[name] = defaultValue[name];
		}
	}
	return config;
}

function resolve(config){
	config.wikiDir = resolveHome(config.wikiDir);
	return config;

	function resolveHome(path){
		return path.replace(/^~/g, env.HOME);
	}
}
function apply(config){
	for(var name in config){
		module.exports[name] = config[name];
	}
}

exports.load = function(callback){
	fs.readFile("./config.json", function(err, data){
		if(err) return callback(err);

		var config = JSON.parse(data);
		for(var name in defaultValue){
			if(!config[name]){
				config[name] = defaultValue[name];
			}
		}

		apply(resolve(config));
		callback(null);
	});
}

var config = {
};

config.load = function(callback){
	fs.readFile("./config.json", function(err, data){
		if(err) return callback(err);

		var config = JSON.parse(data);
		for(var name in config){
			if(!this[name]){
				this[name] = config[name];
			}
		}

		apply(resolve(config));
		callback(null);
	});
}
