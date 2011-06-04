<?php
	//DB SETTINGS -- make this read from a file..?
	define("DB_HOST", "");
	define("DB_USER", "");
	define("DB_PASS", "");
	define("DB_NAME", "");
	define("DB_PERSIST", "");
	
	//Add the pages...
	Page::Add("Error", true);
	Page::Add("Header", true);
	Page::Add("Footer", true);
	Page::Add("Main");
?>