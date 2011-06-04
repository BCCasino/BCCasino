<?php
	class Session {
		public function __set($N, $V) {
			$_SESSION[$N] = $V;
		}
		public function __get($N) {
			return $_SESSION[$N];
		}
		public function __isset($N) {
			return isset($_SESSION[$N]);
		}
		public function __unset($N) {
			unset($_SESSION[$N]);
		}
		public function IsVal($K, $V) {
			return (isset($this->$K) && $this->$K == $V);
		}
		public function GenHash() {
			$Agent = $_SERVER['HTTP_USER_AGENT'];
			$IP = $_SERVER["REMOTE_ADDR"];
			return sha1($Agent . "hash_secret!" . $IP);
		}
	}
?>