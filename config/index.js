var fs = require("fs");
var crypto = require("crypto");
var yaml = require("js-yaml");
var yargs = require("yargs");
var env = process.env;
var join = require("path").join;
var resolve = require("path").resolve;

var WIKINOTE_PATH = env.WIKINOTE_PATH || join(env.HOME, "wiki");

var yargs = require("yargs")
	.usage("Usage : $0 [options]")
	.env("WIKINOTE")
	.option("p", {
		alias : "port",
		describe :"port number",
		nargs : 1,
		"default" : 3000
	})
	.option("n", {
		type : "string",
		alias : "name",
		nargs : 1,
		describe : "wikinote name",
		"default" : "WikiNote"
	})
	.option("frontpage", {
		type : "string",
		describe : "set front page name",
		nargs : 1,
		"default" : "front-page"
	})
	.option("wikinote-path", {
		type : "string",
		describe : "wikinote data path",
		nargs : 1,
		"default" : join(env.HOME, "wiki")
	})
	.option("b", {
		type : "boolean",
		alias : "auto-backup",
		describe : "auto backup with git",
		nargs : 1,
		"default" : true
	});

yargs.showHelp();

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
		readConfig(join(WIKINOTE_PATH, ".app", "config.yaml")).get(),
		readConfig('config/default.yaml').hashCheck('config/.default.hash').get(),
		readConfig('config/local.yaml').get(),
		{
			port : process.env.PORT
		},
		{
			port : yargs.argv["port"],
			wikiname : yargs.argv["wikiname"],
			autoBackup : yargs.argv["auto-backup"],
			wikinotePath : WIKINOTE_PATH
		}
	);

	overwrite(this, config);
	return this;
}

function $save(){
	data = yaml.safeDump(this,{
		indent : 4
	});
	fs.writeFileSync('config/local.yaml', data)
	console.log("overwrite config");
	return this;
}

function readConfig(filename){
	return new FileConfig(filename);
}

function FileConfig(filename){
	this.filename = filename;
	try {
		this.data = fs.readFileSync(filename, 'utf8');
	} catch (e) {
		this.data = {};
	}
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
FileConfig.prototype.liveSet = function(key, value){
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
			dest[key] = src[key];
		} else if(typeof src[key] === "object"){
			dest[key] = dest[key] || {};
			overwrite(dest[key], src[key]);
		} else {
			dest[key] = src[key];
		}
	}
	return dest;
}
function hash(data){
	return crypto.createHash('sha512').update(data).digest("base64").trim();
}

