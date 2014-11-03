module.exports = {
	preArticle : [],
	postArticle : [
		require('./comment').comment
	],
	action : {
		get : {
			//presention : require('./presention')
		},
		post : {
			"$comment" : require("./comment").onComment
		}
	},
	globalAction : {
		get : {
			//"recent-changes" : require('./recent-changes'),
			//"find all" : require('./findall')
		},
		post : {
		}
	}
}
