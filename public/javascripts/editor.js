(function(){
	var ShareDB = require("share");
	var ottext = require("ot-text");
	ShareDB.types.register(ottext.type);


	var protocal = document.location.protocol == "https:" ? "wss" : "ws";
	var socket = new WebSocket(protocal + "://"+ document.location.host+ "/!public/lib/sharedb/ws" + note.path);
	var connection = new ShareDB.Connection(socket);
	var doc = connection.get("wiki", note.path.substr(1));

	var cm = CodeMirror.fromTextArea(document.getElementsByTagName("textarea")[0], {
		mode:  "markdown",
		lineNumbers: true,
		extraKeys : {
			"Ctrl-S" : saveDocument,
			"Cmd-S" : saveDocument,
			"Alt-S" : save,
		},
		indentUnit : 4,
		tabSize : 4,
		indentWithTabs : true,
		profile: "html",
		lineWrapping: true,
	});

	doc.subscribe(function(err){
		if (err) {
			console.log(err);
		}
	});

	// suppress change event cause by shareDB
	var suppress = false;

	// remote to local
	doc.on("load", function(){
		suppress = true;
		cm.setValue(doc.data);
		suppress = false;
	})
	doc.on("op", function(op, isLocalEcho){
		if (isLocalEcho) {
			return;
		}
		suppress = true;
		var pos = 0;
		op.forEach(function(e){
			switch(typeof e){
				case "number":
					pos += e;
					// skip charter
					break;
				case "string":
					cm.replaceRange(e, cm.posFromIndex(pos));
					pos += e.length;
					// insert text
					break;
				case "object":
					cm.remove
					var from = cm.posFromIndex(pos);
					var to = cm.posFromIndex(pos + e.d);
					cm.replaceRange('', from, to);
					// remove text
					break;
			}
		});
		suppress = false;
	})
	// local to remote
	cm.on('change', function(cm, change){
		if (suppress) {
			return;
		}
		var startPos = 0;
		for(var i=0;  i < change.from.line ;i ++){
			startPos +=cm.lineInfo(i).text.length + 1;
		}
		startPos += change.from.ch;

		if (change.to.line == change.from.line && change.to.ch == change.from.ch) {
			// nothing was removed.
		} else {
			// delete.removed contains an array of removed lines as strings, so this adds
			// all the lengths. Later change.removed.length - 1 is added for the \n-chars
			// (-1 because the linebreak on the last line won't get deleted)

			var delLen = change.removed.reduce(function(p, c){ return p + c.length;}, 0) + change.removed.length - 1;
			doc.submitOp([startPos, {d:delLen}]);
		}
		if (change.text) {
			doc.submitOp([startPos, change.text.join('\n')]);
		}
	});


	function saveDocument(){
		var data = "data=" + encodeURIComponent(cm.doc.getValue());
		var options = {
			data :data,
			contentType : "application/x-www-form-urlencoded"
		};
		return $ajax("POST", getSaveApiUrl(), options).then(function(){
			wikinote.common.alert.info("Save successful!");
		}).fail(function(code){
			if(code == 401){
				wikinote.common.alert.warn("Unauthorized!");
			} else {
				wikinote.common.alert.warn("Unexpected Code : " + ajax.readState);
			}
		});
	}
	function save(){
		$("#text").submit();
	}

	// TODO : refactor
	function getSaveApiUrl(){
		return "/!api/1/save?location=" + location.pathname;
	}
	function getUploadApiUrl(){
		return "/!api/1/upload?location=" + location.pathname;
	}
	function getFileListApiUrl(){
		return "/!api/1/files?location=" + location.pathname;
	}
	function upload(){
		var formData = new FormData(document.getElementById("upload"));
		return $ajax("POST", getUploadApiUrl(), {data : formData}).then(function(){
			wikinote.common.alert.info("Upload Success");
		}).fail(function(err){
			wikinote.common.alert.warn("Fail to Uplaod");
		}).fin(function(err){
			$("#upload input").value = "";
		});
	}
	function getFileList(){
		return $ajax("GET", getFileListApiUrl()).then(function(res){
			return JSON.parse(res.text);
		}).then(function(files){
			var $list = $("#filelist");
			files.forEach(function(file){
				$list.appendChild($create("li", file));
			});
		}).fail(function(err){
			console.error(err);
		});
	}
	$("#upload input").on("change", function (){
		upload().then(function(){
			var $list = $("#filelist");

			while ($list.firstChild) {
				$list.removeChild($list.firstChild);
			}
		}).then(getFileList);
	});
	getFileList();

	var md = window.markdownit()
		.use(window.markdownitFootnote)
		.use(window.markdownitDeflist)
		.use(externalLink)

	function externalLink(md, option) {
		var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
			return self.renderToken(tokens, idx, options);
		};

		md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
			var aIndex = tokens[idx].attrIndex('target');

			if (aIndex < 0) {
				tokens[idx].attrPush(['target', '_blank']); // add new attribute
			} else {
				tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
			}

			// pass token to default renderer.
			return defaultRender(tokens, idx, options, env, self);
		};
	}

	function updatePreview(value){
		var $preview = $("article.preview");
		$preview.innerHTML = md.render(value);
	}

	$("article.tab-header li a[href='#']").on("click", function(){
		$("article.edit").classList.remove("hidden");
		$("article.preview").classList.add("hidden");

		$("article.tab-header li a[href='#preview']").parentNode.classList.remove("enabled");
		$("article.tab-header li a[href='#']").parentNode.classList.add("enabled");
	});
	$("article.tab-header li a[href='#preview']").on("click", function(){
		$("article.edit").classList.add("hidden");
		$("article.preview").classList.remove("hidden");
		$("article.tab-header li a[href='#preview']").parentNode.classList.add("enabled");
		$("article.tab-header li a[href='#']").parentNode.classList.remove("enabled");
	});
})();
