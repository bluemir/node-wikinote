var fs = require("fs");

var config = require("../config.json");

var env = process.env;

config.frontPage = config.frontPage || "FrontPage";
config.wikiDir = config.wikiDir || "~/wiki";
config.wikiDir = config.wikiDir.replace(/^~/g, env.HOME);

var o = {
    frontPage : "FrontPage",
    wikiDir : "~/wiki"
}

function resolveHome(path){
    return path.replace(/^~/g, env.HOME);
}

module.exports = config;