(function(){
	function noop(){}

	var keymap = {
		ctrl : {
			"E" : goEditPage,
			"M" : goMovePage,
			"L" : goViewPage
		},
		alt : {
			"S" : saveData,
			"P" : goPresentation
		}
	}

	document.body.addEventListener("keydown", function(e) {
		var keyCode = String.fromCharCode(e.keyCode);
		if(navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey){
			if(keymap.ctrl[keyCode]) {
				keymap.ctrl[keyCode]();
				e.preventDefault();
			}
		} else if(e.altKey) {
			if(keymap.alt[keyCode]){
				keymap.alt[keyCode]();
				e.preventDefault();
			}
		}
	}, false)

	function goViewPage(){
		location.href = getUrl();
	}
	function goEditPage(){
		location.href = getUrl() + "?edit";
	}
	function goMovePage(){
		location.href = getUrl() + "?move";
	}
	function goPresentation(){
		location.href = getUrl() + "?presentation";
	}
	function saveData(){
		if(textarea){
			textarea.form.submit();
		}
	}
	function getUrl(){
		return location.pathname;
	}
})();
