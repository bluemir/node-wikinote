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
function getSaveApiUrl(){
	return "/!api/1/save?location=" + location.pathname;
}
function getUploadApiUrl(){
	return "/!api/1/upload?location=" + location.pathname;
}
function upload(){
	var formData = new FormData(document.getElementById("upload"));
	$ajax("POST", getUploadApiUrl(), {data : formData}).then(function(){
		showMsg("info", "Upload Success");
	}).fail(function(err){
		showMsg("warn", "Fail to Uplaod");
	}).fin(function(err){
		$("#upload input").value = "";
	});
}
$("#upload input").addEventListener("change", upload);
