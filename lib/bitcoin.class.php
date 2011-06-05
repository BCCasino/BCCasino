<?

class Bitcoin
{

	function __construct() {
		$this->bitcoin = new jsonRPCClient('http://BCCasino:Qwerty123456@127.0.0.1:8332/');
	}
	public function getBalance($user)
	{
		return $bitcoin->getbalance($user->username);
	}
	public function debit($user,$amount)
	{
		if(getBalance($user)>$amount)
			return $this->bitcoin->move($user->username,"",(float)$amount,3);
		else
			return -1;
	}
	public function credit($user,$amount)
	{
		if(getbalance("")<$amount)
			throw new exception("CASINOS BROKE SORRY!");
		return $this->bitcoin->move("",$user->username,(float)$amount,3);
	}
	
	public function getDepositAddress($user)
	{
		return $this->bitcoin->getaccountaddress($user->username);
	}
	
	public function withdraw($user,$amount)
	{
		if(getbalance($user)<$amount)
			throw new exception("User is trying to withdraw more than they have!");
		return $this->bitcoin->sendfrom($user->username,$user->bcAddress,(float)$amount,3,"UBCCasino","UBCCasino");
	}
	
	public function getTransaction($txid)
	{
		return $this->bitcoin->gettransaction($txid);
	}
	
	public function listTransactions($user,$cnt=10)
	{
		return $this->bitcoin->listtransactions($user,$cnt);
	}
	
	public function getDifficulty()
	{
		return $this->bitcoin->getdifficulty();
	}
	public function getinfo()
	{
		return $this->bitcoin->getinfo();
	}
	
	public function listAccounts()
	{
		return $this->bitcoin->listaccounts();
	}
	
	
}


?>