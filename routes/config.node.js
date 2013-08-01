var config = require("../config.json");
var env = process.env;

config.wikiDir = config.wikiDir || "~/wiki"
config.wikiDir = config.wikiDir.replace(/^~/g, env.HOME);


module.exports = config;