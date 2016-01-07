var fs = require("fs");
var crypto = require("crypto");
var yaml = require("js-yaml");
var env = process.env;

loadConfig();

function loadConfig(){
	var config = loadDefault();
	var local = loadLocal();

	apply(resolve(overwrite(config, local)));
}

function loadDefault() {
	var doc = read('config/default.yaml');
	if(read("config/.default.hash").trim() !== hash(doc)){
		throw new Error("config/default.yaml is changed");
	}
	return yaml.safeLoad(doc);
}

function loadLocal() {
	var doc = "";
	try {
		doc = read('config/local.yaml');
	} catch (e){
		fs.writeFileSync("config/local.yaml", "", {encoding : "utf8"});
	}
	return yaml.safeLoad(doc);
}

function overwrite(dest, src){
	for(var key in src){
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
function apply(config){
	for(var key in module.exports){
		delete module.exports[key];
	}
	for(var key in config){
		module.exports[key] = config[key];
	}
}

function hash(data){
	return crypto.createHash('sha512').update(data).digest("base64").trim();
}

function read(filename){
	return fs.readFileSync(filename, 'utf8');
}
