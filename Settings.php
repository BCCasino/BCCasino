<?php
	//DB SETTINGS -- make this read from a file..?
	define("DB_HOST", "localhost");
	define("DB_USER", "BCCasino");
	define("DB_PASS", "Qwerty123456");
	define("DB_NAME", "BCCasino");
	define("DB_PERSIST", "");//?
	
	//Add the pages...
	Page::Add("Error", true);
	Page::Add("Header", true);
	Page::Add("Footer", true);
	Page::Add("Main");
?>
