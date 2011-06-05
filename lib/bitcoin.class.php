<?

class Bitcoin
{

	function __construct() {
		$this->bitcoin = new jsonRPCClient('http://BCCasino:Qwerty123456@127.0.0.1:8332/');
	}
	public function getBalance($user)
	{
		return $this->bitcoin->getbalance($user->getUsername());
	}
	public function debit($user,$amount)
	{
		if(getBalance($user)>$amount)
			return $this->bitcoin->move($user->getUsername(),"",(float)$amount,3);
		else
			return -1;
	}
	public function credit($user,$amount)
	{
		if($this->bitcoin->getbalance("")<$amount)
			throw new exception("CASINOS BROKE SORRY!");		
		return $this->bitcoin->move("",$user->getUsername(),(float)$amount,3);
	}
	
	public function getDepositAddress($user)
	{
		return $this->bitcoin->getaccountaddress($user->getUsername());
	}
	
	public function withdraw($user,$amount)
	{
		if(getbalance($user)<$amount)
			throw new exception("User is trying to withdraw more than they have!");
		//round down to nearest cent
		//Currently we will be paying any TX fees, as there is no way through api to get what they were.
		$rounded = $amount *100.0;
		$rounded = floor($rounded);		
		$rounded = $rounded /100.0;
		if($rounded <0)
			throw new exception("User has insufficient funds for withdrawl");
		return $this->bitcoin->sendfrom($user->getUsername(),$user->bcAddress,(float)$rounded,3,"UBCCasino","UBCCasino");
	}
	
	public function getTransaction($txid)
	{
		return $this->bitcoin->gettransaction($txid);
	}
	
	public function listTransactions($user,$cnt=10)
	{
		return $this->bitcoin->listtransactions($user->getUsername(),$cnt);
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