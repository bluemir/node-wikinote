var jellybin = require("jellybin");
var db = jellybin("./groups.json", {create : true});

exports.list = function(callback){
	db.load(callback);
}
exports.permission = function(name, callback){
    db.load(function(err, groups){
        if(err) return callback(err);
        var permission = groups[name];
        if(!permission) return callback(new Error("Not exist group"))
        callback(null, permission);
    });
}
exports.register = function(name, permission, callback){
    db.load(function(err, groups){
        if(err) return callback(err);
        if(groups[name]) return callback(new Error("Already exist group"));
        if(!isCollect(permission)) return callback(new Error("Not collect permission"));
        groups[name] = permission;
        db.save(groups, callback)
    });
}
exports.set = function(name, permission, callback){
    db.load(function(err, groups){
        if(err) return callback(err);
        if(!groups[name]) return callback(new Error("Not exist group"));
        if(!isCollect(permission)) return callback(new Error("Not collect permission"));
        groups[name] = permission;
        db.save(groups, callback)
    });
}
exports.rename = function(oldName, newName, callback){
    db.load(function(err, groups){
        groups[newName] = groups[oldName];
        delete groups[oldName];
        db.save(groups, callback);
    });
}

exports.checkPermission = function(name, permission){
	for(var i = 0; i < permission.length; i++){
		var word = permission.charAt(i);
		if(word != "-" && word != db.json[name].charAt(i)){
			return false;
		}
	}
	return true;
}

function isCollect(permission){
    if(permission.length != 3) return false;
    if(permission.charAt(0) != "r" && permission.charAt(0) != "-") return false;
    if(permission.charAt(1) != "w" && permission.charAt(1) != "-") return false;
    if(permission.charAt(2) != "x" && permission.charAt(2) != "-") return false;
    return true;
}

