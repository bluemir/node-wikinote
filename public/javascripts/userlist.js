(function(global){
	$all("li.user").forEach(function(element) {
		var userId = element.dataset.id;

		var button = element.querySelector("button.user");

		button.addEventListener("click", function(){
			$ajax("DELETE", "/!api/1/user/"+userId).then(function(){
				element.remove();
			});
		});

		$all(element, ".permission").forEach(initPermissionElement);

		$all(element, ".add").forEach(function(element){
			var input = $(element, "input");

			element.addEventListener("click", function(){
				input.focus();
			});

			input.addEventListener("focus", function(event){
				element.classList.add("active");
			});
			input.addEventListener("blur", function(event){
				element.classList.remove("active");
			});

			input.addEventListener("keypress", function(event){
				var permission = input.value.trim();
				if(event.keyCode == 13 && permission != ""){
					var $new = createPermissionElement(userId,  permission);
					element.parentNode.insertBefore($new, element);
					addPermission(userId, permission).then(function(){
						var $icon = $($new, "i");
						$icon.classList.remove("fa-pulse");
						$icon.classList.remove("fa-spinner");
						$icon.classList.add("fa-remove");

						initPermissionElement($new);
					});
					input.value = "";
				}
				element.classList.contains("active");
			});
		});

		function initPermissionElement(element){
			var button = element.querySelector("button.delete");

			var permission = element.dataset.permission;

			button.addEventListener("click", function(){
				var $icon = $(button, "i");
				$icon.classList.remove("fa-remove");
				$icon.classList.add("fa-spinner");
				$icon.classList.add("fa-pulse");

				$ajax("DELETE", "/!api/1/user/"+userId+"/permission/"+permission).then(function(){
					element.remove();
				});
			});
		}
	});
	function addPermission(id, permission){
		return $ajax("PUT", "/!api/1/user/"+id+"/permission/"+permission);
	}
	function createPermissionElement(id, permission){
		var $permission = $create("li");
		$permission.classList.add("permission");
		$permission.dataset.permission = permission;
		$permission.dataset.id = id;
		$permission.appendChild($create("span", permission));

		var $button = $create("button");
		$button.classList.add("delete");

		var $icon = $create("i");
		$icon.classList.add("fa");
		$icon.classList.add("fa-pulse");
		$icon.classList.add("fa-spinner");

		$button.appendChild($icon);

		$permission.appendChild($button);

		return $permission;
	}
})(this);
