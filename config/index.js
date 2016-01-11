var fs = require("fs");
var crypto = require("crypto");
var yaml = require("js-yaml");
var yargs = require("yargs");
var env = process.env;

var yargs = require("yargs")
	.usage("Usage : $0 [options]")
	.env("WIKINOTE")
	.option("p", {
		alias : "port",
		describe :"port number",
		type : "int"
	})
	.option("d", {
		alias : "wiki-dir",
		describe : "wiki repository location"
	})
	.option("n", {
		alias : "wikiname",
		describe : "wikiname"
	})
	.option("frontpage", {
		describe : "set front page name"
	})
	.option("b", {
		alias : "auto-backup",
		describe : "auto backup with git"
	});

//yargs.showHelp();

global.config = module.exports = Object.create({}, {
	$load : {
		value : $load,
	},
	$save : {
		value : $save,
	}
});

function $load(){
	var config = merge(
		readConfig('config/default.yaml').hashCheck('config/.default.hash').get(),
		readConfig('config/local.yaml').get(),
		{
			port : process.env.PORT
		},
		{
			wikiDir : yargs.argv["wiki-dir"],
			port : yargs.argv["port"],
			wikiname : yargs.argv["wikiname"],
			autoBackup : yargs.argv["auto-backup"]
		}
	);

	overwrite(this, resolve(config));
	return this;
}

function $save(){
	return this;
}

function readConfig(filename){
	return new FileConfig(filename);
}

function FileConfig(filename){
	this.filename = filename;
	this.data = fs.readFileSync(filename, 'utf8');
}
FileConfig.prototype.get = function(){
	return yaml.safeLoad(this.data);
}
FileConfig.prototype.hashCheck = function(hashFileName){
	var hashValue = fs.readFileSync(hashFileName, "utf8").trim();
	if (hashValue !== hash(this.data)){
		throw new Error("config/default.yaml is changed");
	}
	return this;
}

function merge(){
	return Array.prototype.reduce.call(arguments, function(prev, current){
		 return overwrite(prev, current);
	}, {});
}

function overwrite(dest, src){
	for(var key in src){
		if(!src[key]) continue;

		if(src[key] instanceof Array){
			dest[key] = dest[key] || [];
			overwrite(dest[key], src[key]);
		} else if(typeof src[key] === "object"){
			dest[key] = dest[key] || {};
			overwrite(dest[key], src[key]);
		} else {
			dest[key] = src[key];
		}
	}
	return dest;
}
function resolve(config){
	config.wikiDir = resolveHome(config.wikiDir);
	return config;

	function resolveHome(path){
		return path.replace(/^~/g, env.HOME);
	}
}

function resolve(config){
	config.wikiDir = resolveHome(config.wikiDir);
	return config;

	function resolveHome(path){
		return path.replace(/^~/g, env.HOME);
	}
}

function hash(data){
	return crypto.createHash('sha512').update(data).digest("base64").trim();
}

global.config.$load();
