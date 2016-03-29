var fs = require("fs");
var crypto = require("crypto");
var yaml = require("js-yaml");
var yargs = require("yargs");
var env = process.env;
var mkdirp = require("mkdirp");
var join = require("path").join;
var resolve = require("path").resolve;
var dirname = require("path").dirname;


var WIKINOTE_PATH = env.WIKINOTE_PATH || join(env.HOME, "wiki");

var yargs = require("yargs")
	.usage("Usage : $0 [options]")
	.env("WIKINOTE")
	.locale("en")
	.help("h").alias("h", "help")
	.option("wikinote-path", {
		type : "string",
		describe : "wikinote data path",
		nargs : 1,
		"default" : join(env.HOME, "wiki")
	})
	.option("c", {
		alias : "config-file",
		describe : "config file path",
		config : true,
		configParser : function(configPath){
			var data = fs.readFileSync(configPath, 'utf8');
			return yaml.safeLoad(data);
		},
		"default" : join(WIKINOTE_PATH, ".app", "config.yaml")
	})
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
	.option("f", {
		alias : "front-page",
		type : "string",
		describe : "set front page name",
		nargs : 1,
		"default" : "front-page"
	})
	.option("b", {
		type : "boolean",
		alias : "auto-backup",
		describe : "auto backup with git",
		nargs : 1,
		"default" : true
	});

global.config = module.exports = Object.create({}, {
	$load : {
		value : $load,
	},
	$save : {
		value : $save,
	}
});

function $load(){
	var config = {
		port : yargs.argv["port"],
		wikiname : yargs.argv["name"],
		autoBackup : yargs.argv["auto-backup"],
		frontPage : yargs.argv["front-page"],
		wikinotePath : WIKINOTE_PATH,
		plugins: yargs.argv["plugins"],
		security : yargs.argv["security"]
	};

	overwrite(this, config);
	return this;
}

function $save(){
	var data = yaml.safeDump(this,{
		indent : 4
	});
	mkdirp.sync(dirname(yargs["config-file"]));
	fs.writeFileSync(yargs["config-file"], data);
	console.log("overwrite config");
	return this;
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

