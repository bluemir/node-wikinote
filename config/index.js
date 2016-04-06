var fs = require("fs");
var crypto = require("crypto");
var yaml = require("js-yaml");
var yargs = require("yargs");
var env = process.env;
var mkdirp = require("mkdirp");
var join = require("path").join;
var resolve = require("path").resolve;
var dirname = require("path").dirname;
var swig = require("swig");

var wikinotePathOption = {
	type : "string",
	describe : "wikinote data path",
	nargs : 1,
	"default" : join(env.HOME, "wiki")
}

var WIKINOTE_PATH = yargs
	.option("wikinote-path", wikinotePathOption)
	.argv["wikinote-path"] || env.WIKINOTE_PATH;

var argv = yargs
	.usage("Usage : $0 [options]")
	.env("WIKINOTE")
	.locale("en")
	.help("h").alias("h", "help")
	.option("wikinote-path", wikinotePathOption)
	.option("c", {
		type : "string",
		alias : "config-file",
		describe : "config file path",
		config : true,
		nargs : 1,
		configParser : function(configPath){
			try {
				var data = fs.readFileSync(configPath, 'utf8');
				return yaml.safeLoad(data);
			} catch(e){
				if(e.code == "ENOENT") {
					return {};
				} else {
					throw e;
				}
			}
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
		alias : ["name", "wikiname"],
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
	})
	.option("save", {
		type : "boolean",
		describe : "save option to file",
	})
	.argv;

global.config = module.exports = Object.create({}, {
	$load : {
		value : $load,
	},
	$save : {
		value : $save,
	},
	$init : {
		value : $init,
	}
});
function $init(){
	var config = this.$load();
	if(argv["save"]){
		this.$save();
	}
	return config;
}

function $load(){
	var config = {
		port : argv["port"],
		wikiname : argv["name"],
		autoBackup : argv["auto-backup"],
		frontPage : argv["front-page"],
		wikinotePath : WIKINOTE_PATH,
		plugins: argv["plugins"] || [],
		security : argv["security"]
	};

	overwrite(this, config);
	return this;
}

function $save(){
	var data = yaml.safeDump(this);
	mkdirp.sync(dirname(argv["config-file"]));
	console.log("overwrite config to " + argv["config-file"]);
	fs.writeFileSync(argv["config-file"], data);
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

