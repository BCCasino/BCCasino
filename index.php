<?php
	//Error reporting for developmental purposes
	error_reporting(E_ALL);
	ini_set('display_errors', true);

	define("PAGE_THEME", "Default");
	define("ABSOLUTEPATH", dirname(__FILE__)); //For templating

	session_start();

	//Load everything
	require_once("lib/Require.lib.php");
	require_folder_once("lib/", array(".class.php"), false);
	require_once("Settings.php");

	/*
	try {
		DB::Connect(DB_Host, DB_User, DB_Pass, DB_Name, DB_Persist);
	} catch (Exception $E) {
		$Header = new Page("Header");
		$Footer = new Page("Footer");
		$Page = new Page("Error");
		$Header->Page = $Page;
		$Header->Footer = $Footer;
		$Page->Header = $Header;
		$Page->Footer = $Footer;
		$Footer->Header = $Header;
		$Footer->Page = $Page;
		$Page->Error = "The database is down, please try again later.";
		$Page->LoadPage();
		echo $Header->ParseTemplate();
		echo $Page->ParseTemplate();
		echo $Footer->ParseTemplate();
		die();
	}
 	*/

	function JSONtoAmount($value) {
	    return round(value * 1e8);
	}

	$Header = new Page("Header");
	$Footer = new Page("Footer");
	$Page = new Page();

	$Header->Page = $Page;
	$Header->Footer = $Footer;
	$Page->Header = $Header;
	$Page->Footer = $Footer;
	$Footer->Header = $Header;
	$Footer->Page = $Page;


	if (isset($_GET["notemplate"])) {
		$Page->LoadPage();
		echo $Page->ParseTemplate();
		die();
	}

	try {
		$Page->LoadPage(); //Page gets first go
		$Header->LoadPage();
		$Footer->LoadPage();
	} catch (Exception $E) {
		$Header = new Page("Header");
		$Footer = new Page("Footer");
		$Page = new Page("Error");
		$Header->Page = $Page;
		$Header->Footer = $Footer;
		$Page->Header = $Header;
		$Page->Footer = $Footer;
		$Footer->Header = $Header;
		$Footer->Page = $Page;
		$Page->Error = "Something went wrong while loading the page you requested... Please try again later.";
		$Page->LoadPage();
		echo $Header->ParseTemplate();
		echo $Page->ParseTemplate();
		echo $Footer->ParseTemplate();
		die();
	}

	//ob_start("ob_gzhandler");
	echo $Header->ParseTemplate();
	echo $Page->ParseTemplate();
	echo $Footer->ParseTemplate();
?>
