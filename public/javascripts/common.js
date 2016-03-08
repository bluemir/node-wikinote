var wikinote = {};
wikinote.common = (function(){
	function noop(){}

	var keymap = {
		ctrl : {
			"E" : goEditPage,
			"M" : goMovePage,
			"L" : goViewPage
		},
		alt : {
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
	function getUrl(){
		return location.pathname;
	}

	function createMsgElement(str){
		var $msg = document.createElement("p");
		$msg.classList.add("msg-dynamic");
		$msg.innerHTML = str;

		$msg.addEventListener("animationend", function(){
			$msg.parentElement.removeChild($msg);
		}, false);

		return $msg;
	}
	function showInfo(msg){
		var $msg = createMsgElement(msg);
		var $alert = document.querySelector("#alert");

		$alert.appendChild($msg);

	}
	function showWarning(){
		var $msg = createMsgElement(msg);
		$msg.classList.add("warn");
		var $alert = document.querySelector("#alert");

		$alert.appendChild($msg);
	}

	return {
		alert : {
			warn: showWarning,
			info : showInfo
		}
	}
})();
