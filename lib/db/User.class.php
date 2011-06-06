<?php
	class User extends Base {
		public static $Table = "users";
		public function __construct($ID = false, $Row = false) {
			$this->_SaveOnDestruct = true;
			parent::__construct($ID, $this, $Row, self::$Table);
		}
		
		public function getUsername() {
			return $this->Get("username"); //gets this user's entry in the database under the username field.
		}
	}
?>