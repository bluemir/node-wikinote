var nodegit = require("nodegit");
var path = require("path");
var config = require("../config");

exports.getHistory = function(wikipath){
	var repo;
	//FIXME clear filename
	var filepath = wikipath.toString().substr(1) + ".md";

	return nodegit.Repository.open(config.wikinotePath).then(function(r){
		repo = r;
		return repo.getMasterCommit();
	}).then(function(firstCommitOnMaster){
		var walker = repo.createRevWalk();

		walker.push(firstCommitOnMaster.sha());
		walker.sorting(nodegit.Revwalk.SORT.Time);

		return walker.fileHistoryWalk(filepath.toString(), 500);
	}).then(continueSearch).then(function(result){
		return result.map(function(entry){
			var commit = entry.commit;

			var author = commit.author();
			return {
				date : commit.date().toString(),
				id : commit.sha().substr(0, 8),//commit.id().toString(),
				subject : commit.message(),
				author : {
					name : author.name(),
					email : author.email()
				}
			};
		});
	});
	function continueSearch(result){
		if(!result || result.length === 0){
			return [];
		}
		var lastCommit = result[result.length - 1].commit.sha();

		if(result.length == 1 && result[0].commit.sha() == lastCommit){
			//default case
			return [];
		}
		var walker = repo.createRevWalk();
		walker.push(lastCommit);
		walker.sorting(nodegit.Revwalk.SORT.TIME);

		return walker.fileHistoryWalk(filepath.toString(), 500).then(continueSearch).then(function(innerResult){
			return result.concat(innerResult);
		});
	}
}
exports.commit = function(wikipath, message, auth) {
	var repo;
	var filepath = wikipath.toString().substr(1) + ".md";
	nodegit.Repository.open(config.wikinotePath).then(function(r){
		repo = r;
	}).then(function(){
		return repo.refreshIndex();
	}).then(function(index){
		index.addByPath(filepath)
		return index;
	}).then(function(index){
		index.write();
		return index;
	}).then(function(index){
		return index.writeTree();
	}).then(function(oidResult) {
		oid = oidResult;
		return nodegit.Reference.nameToId(repo, "HEAD");
	}).then(function(head) {
		  return repo.getCommit(head);
	}).then(function(parent) {
		auth = auth || {};
		auth.id = auth.id || "anomymous";
		auth.email = auth.email || auth.id + "@wikinote";

		var author = nodegit.Signature.now(auth.id, auth.email);
		var committer = author;

		return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
	});
}
