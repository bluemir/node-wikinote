var $signup = document.getElementById("signup");
var $id = document.getElementById("signup.id");
var $password = document.getElementById("signup.password");
var $confirm = document.getElementById("signup.confirm");

$signup.addEventListener('submit', function(e){
	if($password.value != $confirm.value){
		dynamicMsg("password and password cofirm didn't match up");
		e.preventDefault();
		return false;
	}
	if($id = "" || $password.value == "" || $confirm.value == ""){
		dynamicMsg("please fill sign up form");
		e.preventDefault();
		return false;
	}

	function dynamicMsg(str){
		
		var $msg = document.getElementById("message");
		$msg.innerHTML = str;
		$msg.style.display = "block";
		$msg.style.opacity = 1;

		$msg.classList.add("warn");

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
});
