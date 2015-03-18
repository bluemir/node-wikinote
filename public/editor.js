var cm = CodeMirror.fromTextArea(document.getElementsByTagName("textarea")[0], {
	mode:  "markdown",
	lineNumbers: true,
	extraKeys : {
		"Ctrl-S" : function(){
			var ajax = new XMLHttpRequest();
			ajax.open("POST", getApiUrl());
			ajax.addEventListener("readystatechange", function(){
				if(ajax.readyState == "4"){
					if(ajax.status == 200){
						showMsg("info", "Save successful!");
					} else if(ajax.status == 401){
						showMsg("warn", "Unauthorized");
					} else {
						showMsg("warn", "Unexpected Code : " + ajax.readState);
					}
				}
			});
			ajax.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			ajax.send("data=" + encodeURIComponent(cm.doc.getValue()));
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
function showMsg(level, message){
	var $msg = document.getElementById("message");
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
function getApiUrl(){
	return "/!api/1/save?location=" + location.pathname;
}
function getUploadApiUrl(){
	return "/!api/1/upload?location=" + location.pathname;
}
function upload(){
	var formData = new FormData(document.getElementById("upload"));
	$ajax("POST", getUploadApiUrl(), formData).then(function(){
		showMsg("info", "Upload Success");
	}).fail(function(err){
		showMsg("warn", "Fail to Uplaod");
	}).fin(function(err){
		$("#upload input").value = "";
	});
}
$("#upload input").addEventListener("change", upload);
