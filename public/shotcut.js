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
		if(navigator.platform.match("Mac") ? e.metaKey : e. ctrlKey){
			(keymap.ctrl[String.fromCharCode(e.keyCode)] || noop)();
			e.preventDefault();
		} else if(e.altKey) {
			(keymap.alt[String.fromCharCode(e.keyCode)] || noop)();
			e.preventDefault();
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
