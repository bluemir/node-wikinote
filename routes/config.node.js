var config = require("../config.json");
var env = process.env;

config.frontPage = config.frontPage || "FrontPage";
config.wikiDir = config.wikiDir || "~/wiki";
config.wikiDir = config.wikiDir.replace(/^~/g, env.HOME);
config.salt = config.salt || "123456789";

module.exports = config;