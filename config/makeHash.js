var fs = require("fs");
var crypto = require("crypto");

var doc = fs.readFileSync("config/default.yaml", { encoding : "utf8" });

fs.writeFileSync("config/.default.hash", hash(doc), {encoding : "utf8"});

console.log("succese");

function hash(data){
	return crypto.createHash('sha512').update(data).digest("base64");
}
