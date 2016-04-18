(function(){
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
		readOnly : "nocursor"
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
	}
	emmetPlugin.clearKeymap();
	emmetPlugin.setKeymap({
		'Ctrl-Enter': 'expand_abbreviation'
	});

	var timer = null;

	cm.on("change", function(){
		clearTimeout(timer);
		timer = setTimeout(function(){
			socket.close();
			doc.destroy();
			cm.setOption("readOnly", "nocursor");
		}, 15 * 60 * 1000);
		updatePreview(cm.getValue());
		cm.save();
	});
	cm.on("mousedown", function(){
		if(cm.getOption("readOnly") == "nocursor"){
			wikinote.common.alert.warn("Connection lost. please <a href='"+location.href+"'>reload this page</a>");
		}
	})

	var socket = new BCSocket("/!public/lib/channel", {reconnect: true});
	var sjs = new window.sharejs.Connection(socket);
	var doc = sjs.get('wiki', note.path);

	doc.subscribe();
	doc.whenReady(function () {
		if (!doc.type) doc.create('text', cm.getValue());
		if (doc.type && doc.type.name === 'text') {
			doc.attachCodeMirror(cm);
		}

		cm.setOption("readOnly", false);
	});

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
