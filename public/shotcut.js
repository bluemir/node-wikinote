(function(){

	document.body.addEventListener("keydown", function(e) {
		if(navigator.platform.match("Mac") ? e.metaKey : e. ctrlKey){
			if(e.keyCode == "E".charCodeAt(0)){
				goEditPage();
				e.preventDefault();
			} else if(e.keyCode == "M".charCodeAt(0)){
				goMovePage();
				e.preventDefault();
			} else if(e.keyCode == "L".charCodeAt(0)){
				goViewPage();
				e.preventDefault();
			} else if(e.keyCode == "S".charCodeAt(0)){
				saveDataWithAjax();
				printSaveMsg();
				e.preventDefault();
			}
		} else if(e.altKey){
			if(e.keyCode == "S".charCodeAt(0)){
				saveData();
				e.preventDefault();
			} else if (e.keyCode =="P".charCodeAt(0)) {
				goPresentation();
				e.preventDefault();
			}
		} else if(e.keyCode == 122) {//F11
			goPresentation();
		}
	}, false);

	var textarea = document.getElementsByTagName("textarea")[0];
	if(textarea){
		textarea.addEventListener("keydown", function(e) {
			if(e.keyCode == "\t".charCodeAt(0)){
				e.preventDefault();
				var start = this.selectionStart;
				var end  = this.selectionEnd;
				this.value = this.value.substring(0,start) + "\t" + this.value.substring(end);
				this.selectionEnd = start+1;
			}
		});
		textarea.focus();
	}

	function goViewPage(){
		location.href = getUrl();
	}
	function goEditPage(){
		location.href = getUrl() + "?edit";
	}
	function goMovePage(){
		location.href = getUrl() + "?move";
	}

	function saveData(){
		if(textarea){
			textarea.form.submit();
		}
	}
	function getUrl(){
		return location.pathname;
	}


	function saveDataWithAjax(data){
		if(textarea){
			var ajax = new XMLHttpRequest();
			ajax.open("POST", getUrl() + "?edit");
			ajax.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			ajax.send("data=" + encodeURIComponent(textarea.value));
		}
	}
	function goPresentation(){
		location.href = getUrl() + "?presentation";
	}
	function printSaveMsg(){
		var $msg = document.getElementById("message");
		$msg.innerHTML = "Save successful!";
		$msg.style.display = "block";
		$msg.style.opacity = 1;

		var op = 1;
		setTimeout(function loop(){
			$msg.style.opacity = op;
			op -= 0.02;
			if(op > 0)
				setTimeout(loop, 20);
			else 
				$msg.style.display = "none";
		}, 0.5 * 1000);

	}
})();
