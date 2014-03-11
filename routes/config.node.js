var fs = require("fs");
var env = process.env;

apply(resolve(load()));

var defaultValue = {
    frontPage : "FrontPage",
    wikiDir : "~/wiki",
    autoBackup : false,
	wikiname : "WikiNote"
}

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
