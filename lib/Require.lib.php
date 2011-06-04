<?php
	function require_folder_once($Path, $Extensions = array(".php"), $Recursive = true) {
		if (!file_exists($Path))
			throw new Exception("Folder doesn't exist");
		if (count($Extensions) <= 0)
			throw new Exception("Didn't pass any extensions to check");
		$End = substr($Path, -1);
		if ($End != "/" || $End != "\\")
			$Path .= "/";
		$Listing = array_diff(scandir($Path), array(".", ".."));
		foreach ($Listing as $Item) {
			$PItem = $Path . $Item;
			if (is_dir($Item) && $Recursive) {
				require_folder_once($PItem, $Extensions);
			} else {
				foreach ($Extensions as $Ext) {
					$Len = strlen($Ext);
					$End = substr($Item, $Len*-1);
					if ($End == $Ext) {
						require_once($PItem);
						break;
					}
				}
			}
		}
	}
?>