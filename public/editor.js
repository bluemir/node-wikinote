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
	profile: "html"
});
emmetPlugin.clearKeymap();
emmetPlugin.setKeymap({
	'Ctrl-Enter': 'expand_abbreviation'
});
function showMsg(level, message){
	var $msg = document.getElementById("message");
	$msg.innerHTML = message;
	$msg.style.display = "block";
	$msg.style.opacity = 1;

	$msg.classList.add(level);

	var op = 1;
	setTimeout(function loop(){
		$msg.style.opacity = op;
		op -= 0.02;
		if(op > 0)
			setTimeout(loop, 20);
		else 
			$msg.style.display = "none";
		$msg.classList.remove(level);
	}, 0.5 * 1000);
}
function getApiUrl(){
	return "/!api/1/save?location=" + location.pathname;
}
