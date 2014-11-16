var fs = require("fs");
var crypto = require("crypto");
var env = process.env;

var DEFAULT_HASH = "n3rzm6rLUIZ0GKpMC+XS1uBZ1aoRVT+iyKN0TL3HtClokNV6lhRW0MjhKNF02JhlXN9pWQs+kYp2hh9md0QXRA==";

loadConfing();

var watcher = fs.watch("config/local.json");

watcher.on('change', function(event, filename){
	try {
		var config = loadDefault();

		var local = loadLocals();

		overwrite(config, local);

		apply(resolve(config));
		console.log("change config " + filename);
	} catch(e) {
		console.log(e, filename);
	}
});

function loadConfing(){
	var config = loadDefault();

	var local = {};
	if(fs.existsSync("config/local.json")){
		local = loadLocals();
	} else {
		fs.writeFileSync("config/local.json", "{}", {encoding : "utf8"});
	}

	overwrite(config, local);

	apply(resolve(config));
}


function loadDefault() {
	var config = fs.readFileSync("config/default.json", { encoding : "utf8" });

	//check default file change
	if(DEFAULT_HASH !== hash(config)){
		throw new Error("config/default.json is changed");
	}
	return JSON.parse(removeComment(config));
}

function loadLocals() {
	var data = fs.readFileSync("config/local.json", {encoding :"utf8"})
	return JSON.parse(removeComment(data));
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
	return crypto.createHash('sha512').update(data).digest("base64");
}

function removeComment(str) {

	var uid = '_' + +new Date(),
	primitives = [],
	primIndex = 0;

	return (
		str

		/* Remove strings */
		.replace(/(['"])(\\\1|.)+?\1/g, function(match){
			primitives[primIndex] = match;
			return (uid + '') + primIndex++;
		})

		/* Remove Regexes */
		.replace(/([^\/])(\/(?!\*|\/)(\\\/|.)+?\/[gim]{0,3})/g, function(match, $1, $2){
			primitives[primIndex] = $2;
			return $1 + (uid + '') + primIndex++;
		})

		/*
		   - Remove single-line comments that contain would-be multi-line delimiters
		   E.g. // Comment /* <--
		   - Remove multi-line comments that contain would be single-line delimiters
		   E.g. /* // <--
		   */
		   .replace(/\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//g, '')

			   /*
				  Remove single and multi-line comments,
				  no consideration of inner-contents
				  */
			   .replace(/\/\/.+?(?=\n|\r|$)|\/\*[\s\S]+?\*\//g, '')

			   /*
				  Remove multi-line comments that have a replaced ending (string/regex)
				  Greedy, so no inner strings/regexes will stop it.
				  */
			   .replace(RegExp('\\/\\*[\\s\\S]+' + uid + '\\d+', 'g'), '')

		   /* Bring back strings & regexes */
		   .replace(RegExp(uid + '(\\d+)', 'g'), function(match, n){
			   return primitives[n];
		   })
	);
};

