(function(){
	var $signup = $("#signup");
	var $id = $("#signup .id");
	var $password = $("#signup .password");
	var $confirm = $("#signup .confirm");

	$signup.addEventListener('submit', function(e){
		if($password.value != $confirm.value){
			wikinote.common.alert.warn("password and password cofirm didn't match up");
			e.preventDefault();
			return false;
		}
		if($id = "" || $password.value == "" || $confirm.value == ""){
			wikinote.common.alert.warn("please fill sign up form");
			e.preventDefault();
			return false;
		}
	});
})();
