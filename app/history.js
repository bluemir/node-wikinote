var nodegit = require("nodegit");
var path = require("path");
var config = require("../config");

exports.getHistory = function(wikipath){
	var repo;
	//FIXME clear filename
	var filepath = wikipath.toString().substr(1) + ".md";

	return nodegit.Repository.open(config.wikiDir).then(function(r){
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
		if(!result){
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
