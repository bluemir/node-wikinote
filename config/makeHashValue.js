var fs = require("fs");
var crypto = require("crypto");

console.log(hash(fs.readFileSync("config/default.json", { encoding : "utf8" })));

function hash(data){
	return crypto.createHash('sha512').update(data).digest("base64");
}
