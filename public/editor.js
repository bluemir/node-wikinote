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
		$ajax("POST", getSaveApiUrl(), options).then(function(){
			showMsg("info", "Save successful!");
		}).fail(function(code){
			if(code == 401){
				showMsg("warn", "Unauthorized");
			} else {
				showMsg("warn", "Unexpected Code : " + ajax.readState);
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
			showMsg("WARN", "Connection lost. please <a href='"+location.href+"'>reload this page</a>");
		}
	})

	var socket = new BCSocket("/!public/channel", {reconnect: true});
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

	function showMsg(level, message){
		var $msg = $("#message");
		$msg.classList.add(level);

		$msg.innerHTML = message;
		$msg.style.display = "block";
		$msg.style.opacity = 1;

		Q.delay(1000).then(interval(20, 500)).progress(function(ratio){
			$msg.style.opacity = 1 - ratio;
		}).then(function(){
			$msg.classList.remove(level);
			$msg.style.display = "none";
		});
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
			showMsg("info", "Upload Success");
		}).fail(function(err){
			showMsg("warn", "Fail to Uplaod");
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
	$("#upload input").addEventListener("change", function (){
		upload().then(function(){
			var $list = $("#filelist");

			while ($list.firstChild) {
				$list.removeChild($list.firstChild);
			}
		}).then(getFileList);
	});
	getFileList();

	var externalLinksRenderer = new marked.Renderer();
	var protocolRegexp = /^https?:\/\/.+$/;
	externalLinksRenderer.link = function(href, title, text){
		var external = protocolRegexp.test(href);
		return "<a href=\"" + href + "\"" +
			(external ? " target=\"_blank\"" : "")+
			(title ? " title=\"" + title + "\"" : "") +
			">" + text + "</a>";
	}

	marked.setOptions({
		gfm: true,
		tables: true,
		breaks: false,
		pedantic: false,
		sanitize: false,
		smartLists: true,
		footnotes : true,
		renderer : externalLinksRenderer
	});

	function updatePreview(value){
		var $preview = $("article.preview");
		$preview.innerHTML = marked(value);
	}

	$("article.tab-header li a[href='#']").addEventListener("click", function(){
		$("article.edit").classList.remove("hidden");
		$("article.preview").classList.add("hidden");

		$("article.tab-header li a[href='#preview']").parentNode.classList.remove("enabled");
		$("article.tab-header li a[href='#']").parentNode.classList.add("enabled");
	});
	$("article.tab-header li a[href='#preview']").addEventListener("click", function(){
		$("article.edit").classList.add("hidden");
		$("article.preview").classList.remove("hidden");
		$("article.tab-header li a[href='#preview']").parentNode.classList.add("enabled");
		$("article.tab-header li a[href='#']").parentNode.classList.remove("enabled");
	});
})();
