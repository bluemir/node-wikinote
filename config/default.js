module.exports = [
	"#Can't auto reload",
	"port : 4000",
	"#Can auto reload",
	"frontPage : FrontPage",
	"wikiDir : ~/wiki",
	"autoBackup : false",
	"#security :",
	"#    salt : 123456789",
	"#    defaultPermissions :",
	"#        - read",
	"#        - write",
	"wikiname : WikiNote",
	"plugins :",
	"	- remark"
].join("\n");
