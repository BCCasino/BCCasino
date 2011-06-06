<?php
	//Backend for Main.php, see themes/default/Main.php for output.
	$user = new User(0); //Load userid 0...
	$bitcoin = new Bitcoin('http://BCCasino:Qwerty123456@127.0.0.1:8332/');
	
	$this->user = $user;
	$this->bitcoin = $bitcoin;	
?>
