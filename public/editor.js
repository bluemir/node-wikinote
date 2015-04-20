var cm = CodeMirror.fromTextArea(document.getElementsByTagName("textarea")[0], {
	mode:  "markdown",
	lineNumbers: true,
	extraKeys : {
		"Ctrl-S" : function(){
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
	},
	indentUnit : 4,
	tabSize : 4,
	indentWithTabs : true,
	profile: "html",
	lineWrapping: true
});
emmetPlugin.clearKeymap();
emmetPlugin.setKeymap({
	'Ctrl-Enter': 'expand_abbreviation'
});
cm.on("change", function(){
	cm.save();
});

var socket = new BCSocket("/!public/channel", {reconnect: true});
var sjs = new window.sharejs.Connection(socket);
var doc = sjs.get('wiki', note.path);

doc.subscribe();
doc.whenReady(function () {
	if (!doc.type) doc.create('text', cm.getValue());
	if (doc.type && doc.type.name === 'text') {
		doc.attachCodeMirror(cm);
	}
});

function showMsg(level, message){
	var $msg = $("#message");
	$msg.classList.add(level);

	$msg.innerHTML = message;
	$msg.style.display = "block";
	$msg.style.opacity = 1;


	Q.delay(500).step(20, 500).progress(function(ratio){
		$msg.style.opacity = 1 - ratio;
	}).then(function(){
		$msg.classList.remove(level);
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
