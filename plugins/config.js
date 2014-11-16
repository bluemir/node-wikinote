module.exports = {
	preArticle : [],
	postArticle : [
		require('./comment').comment
	],
	action : {
		get : {
			"presentation" : require('./presentation')
		},
		post : {
			"comment" : require("./comment").writeComment
		}
	},
	globalAction : {
		get : {
			//"recent-changes" : require('./recent-changes'),
			//"find all" : require('./findall')
		},
		post : {
		}
	},
	assets : {
		comment : require("./comment").assets(),
		presentation : require("./presentation").assets()
	}
}
