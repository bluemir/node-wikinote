(function(global){
	$all(".permission").forEach(function(element){
		var button = element.querySelector("button");

		var userid = element.dataset.id;
		var permission = element.dataset.permission;

		button.addEventListener("click", function(){
			$ajax("DELETE", "/!api/1/user/"+userid+"/permission/"+permission).then(function(){
				element.remove();
			});
		});
	});
	$all("li.user").forEach(function(element) {
		var userid = element.dataset.id;

		var button = element.querySelector("button.user");

		button.addEventListener("click", function(){
			$ajax("DELETE", "/!api/1/user/"+userid).then(function(){
				element.remove();
			});
		});
	});
})(this);
