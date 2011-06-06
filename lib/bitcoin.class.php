<?php
	class Bitcoin {
		function __construct($Server) {
			$this->bitcoin = new jsonRPCClient($Server);
		}
		public function getBalance(User $user) {
			return $this->bitcoin->getbalance($user->getUsername(), 3);
		}
		public function debit(User $user,$amount) {
			if ($this->getBalance($user) > $amount)
				return $this->bitcoin->move($user->getUsername(), "", (float)$amount, 3);
			
			return -1;
		}
		public function credit($user,$amount) {
			if ($this->bitcoin->getbalance("") < $amount)
				throw new Exception("CASINOS BROKE SORRY!");		
			return $this->bitcoin->move("", $user->getUsername(), (float)$amount, 3);
		}
		
		public function getDepositAddress($user) {
			return $this->bitcoin->getaccountaddress($user->getUsername());
		}
		
		public function withdraw($user,$amount) {
			if (getbalance($user) < $amount)
				throw new Exception("User is trying to withdraw more than they have!");
			//round down to nearest cent
			//Currently we will be paying any TX fees, as there is no way through api to get what they were.
			$rounded = $amount * 100.0;
			$rounded = floor($rounded);		
			$rounded = $rounded / 100.0;
			if ($rounded < 0)
				throw new Exception("User has insufficient funds for withdrawl");
			return $this->bitcoin->sendfrom($user->getUsername(), $user->bcAddress, (float)$rounded, 1, "UBCCasino", "UBCCasino");
		}
		
		public function getTransaction($txid) {
			return $this->bitcoin->gettransaction($txid);
		}
		
		public function listTransactions($user, $cnt=10) {
			return $this->bitcoin->listtransactions($user->getUsername(), $cnt);
		}
		
		public function getDifficulty() {
			return $this->bitcoin->getdifficulty();
		}
		public function getinfo() {
			return $this->bitcoin->getinfo();
		}
		
		public function listAccounts() {
			return $this->bitcoin->listaccounts();
		}
	}
?>