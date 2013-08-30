var $signup = document.getElementById("signup");
var $id = document.getElementById("signup.id");
var $password = document.getElementById("signup.password");
var $confirm = document.getElementById("signup.confirm");

$signup.addEventListener('submit', function(e){
	if($password.value != $confirm.value){
		e.preventDefault();
		return false;
	}
});
