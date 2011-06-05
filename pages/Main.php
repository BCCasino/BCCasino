<?php
	$user = new User("Test");
	
	$bitcoin = new Bitcoin();	
	print_r($bitcoin->listtransactions($user));
?>
