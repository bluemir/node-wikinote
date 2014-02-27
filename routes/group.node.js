var fs = require("fs");

exports.list = function(callback){
	load(callback);
}
exports.permission = function(name, callback){
    load(function(err, groups){
        if(err) return callback(err);
        var permission = groups[name];
        if(!permission) return callback(new Error("Not exist group"))
        callback(null, permission);
    });
}
exports.register = function(name, permission, callback){
    load(function(err, groups){
        if(err) return callback(err);
        if(groups[name]) return callback(new Error("Already exist group"));
        if(!isCollect(permission)) return callback(new Error("Not collect permission"));
        groups[name] = permission;
        save(groups, callback)
    });
}
exports.set = function(name, permission, callback){
    load(function(err, groups){
        if(err) return callback(err);
        if(!groups[name]) return callback(new Error("Not exist group"));
        if(!isCollect(permission)) return callback(new Error("Not collect permission"));
        groups[name] = permission;
        save(groups, callback)
    });
}
exports.rename = function(oldName, newName, callback){
    load(function(err, groups){
        groups[newName] = groups[oldName];
        delete groups[oldName];
        save(groups, callback);
    });
}

function isCollect(permission){
    if(permission.length != 3) return false;
    if(permission.charAt(0) != "r" && permission.charAt(0) != "-") return false;
    if(permission.charAt(1) != "w" && permission.charAt(1) != "-") return false;
    if(permission.charAt(2) != "x" && permission.charAt(2) != "-") return false;
    return true;
}

function load(callback){
	try {
		var groups = require("../groups.json");
		callback(null, groups);
	} catch(e){
		callback(e)
	}
}
function save(groups, callback){
	fs.writeFile("./groups.json", JSON.stringify(users, null, 4), {encode : "utf8"}, callback);
}
