<?php
	if (!defined("PAGE_THEME"))
		define("PAGE_THEME", "Default");
	define("PAGE_GETVAR", "p");
	define("PAGE_ERRORPAGE", "Error");
	define("PAGE_INDEXPAGE", "Main");
	define("PAGE_PAGEFOLDER", "pages");
	define("PAGE_THEMEFOLDER", "themes");
	
	/**
	 * Versatile templating class
	 * Before doing anything with this class you must define ABSOLUTEPATH to the root of your website without a trailing slash.
	 * @author Andrew Hunt <ahuntdesign@gmail.com>
	 * @version 1.0.0
	 */
	class Page {
		/**
		 * Private variables will not be documented... should be self-explanitory anyways.
		 */
		private $Page, $TemplateFile, $PageFile, $TemplatePath;
		private $Vars = array();
		private static $Theme = PAGE_THEME;
		private static $Pages = array();
		
		/**
		 * Determines what page/template files to load.
		 * Also does preliminary error checking.
		 * @return Void
		 * @param $Page String[optional]
		 */
		public function __construct($Page = false) {
			if (!$Page) {
				$Page = (isset($_GET[PAGE_GETVAR]) ? $_GET[PAGE_GETVAR] : PAGE_INDEXPAGE);
				if (!self::PageExists($Page))
					$Page = PAGE_ERRORPAGE;
				else {
					if (self::$Pages[$Page]["Internal"])
						$Page = PAGE_ERRORPAGE;
				}
			} else {
				if (!self::PageExists($Page))
					$Page = PAGE_ERRORPAGE;
			}
			$this->Page = $Page;
			$this->TemplateFile = self::$Pages[$Page]["Template"];
			$this->PageFile = self::$Pages[$Page]["Page"];
			$this->TemplatePath = PAGE_THEMEFOLDER . "/" . self::$Theme . "/";
		}
		
		/**
		 * Loads the page file
		 * @return Void
		 */
		public function LoadPage() {
			include($this->PageFile);
		}
		
		/**
		 * Extracts the page's variables into the symbol array for the template to display
		 * @return String Parsed Template File
		 */
		public function ParseTemplate() {
			extract($this->Vars);
			$Extra = array(
				"Path"	=>	$this->TemplatePath);
			extract($Extra, EXTR_PREFIX_ALL, "P");
			ob_start();
			@include($this->TemplateFile);
			$Page = ob_get_contents();
			ob_end_clean();
			return $Page;
		}
		
		/**
		 * Sets a variable to be used in the template
		 * @return Void
		 * @param $Var Mixed Variable
		 * @param $Value Mixed Value to assign to the variable
		 */
		public function __set($Var, $Value) {
			$this->Vars[$Var] = $Value;
		}
		
		/**
		 * Gets a variable that was set to be used in the template
		 * Only use this in the non-template page
		 * @return Void
		 * @param $Var Mixed Variable
		 */
		public function __get($Var) {
			return $this->Vars[$Var];
		}
		
		/**
		 * Unsets a variable
		 * @return Void
		 * @param $Var Mixed
		 */
		public function __unset($Var) {
			unset($this->Vars[$Var]);
		}
		
		/**
		 * Checks a variable is set
		 * @param $Var Mixed
		 * @return Boolean
		 */
		public function __isset($Var) {
			return array_key_exists($Var, $this->Vars);
		}
		
		/**
		 * Sets the theme which all page classes will use
		 * @return Void
		 * @param $Theme String[optional]
		 */
		public static function SetTheme($Theme = "Default") {
			self::$Theme = $Theme;
		}
		
		/**
		 * Gets the current theme
		 * @return String
		 */
		public static function GetTheme() {
			return self::$Theme;
		}
		
		/**
		 * Checks if the page exists
		 * @return Boolean
		 * @param $Page String
		 */
		public static function PageExists($Page) {
			return array_key_exists($Page, self::$Pages) && file_exists(self::$Pages[$Page]["Page"]) && file_exists(self::$Pages[$Page]["Template"]);
		}
		
		/**
		 * Adds a page
		 * @return Void
		 * @param $Page String
		 * @param $InternalPage Boolean[optional] Can only be accessed from code?
		 */
		public static function Add($Page, $InternalPage = false) {
			if (self::PageExists($Page))
				throw new Exception("Attempting to add a page which already exists, '$Page'");
			self::$Pages[$Page] = array(
				"Page"		=>	ABSOLUTEPATH . "/" . PAGE_PAGEFOLDER . "/$Page.php",
				"Template"	=>	ABSOLUTEPATH . "/" . PAGE_THEMEFOLDER . "/" . self::$Theme . "/$Page.php",
				"Internal"	=>	$InternalPage);
		}
		
		/**
		 * Generates a relative URL to a page containing the correct GET variable
		 * @return String
		 * @param $Page String
		 * @param $Keep Array[optional] Array of $_GET variables to keep. Pass their keys in the array.
		 */
		public static function URL($Page, $Keep = array()) {
			$Add = "";
			foreach ($Keep as $K) {
				if (array_key_exists($K, $_GET))
					$Add .= "&$K=" . $_GET[$K];
			}
			return "index.php?" . PAGE_GETVAR . "=$Page$Add";
		}
		
		public static function Redirect($Page = false, $Keep = array()) {
			if ($Page === false)
				$Page = PAGE_INDEXPAGE;
			header("Location: " . self::URL($Page, $Keep));
			die();
		}
	}
?>