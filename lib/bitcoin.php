<?

class Bitcoin
{
	private $bitcoin = new jsonRPCClient('http://BCCasino:Qwerty123456@127.0.0.1:8332/');
	
	public function getBalance($user)
	{
		return $bitcoin->getbalance($user->username);
	}
	public function debit($user,$amount)
	{
		if(getBalance($user)>$amount)
			return $bitcoin->move($user->username,"",(float)$amount,3);
		else
			return -1;
	}
	public function credit($user,$amount)
	{
		if($bitcoin->getbalance("")<$amount)
			throw new exception("CASINOS BROKE SORRY!");
		return $bitcoin->move("",$user->username,(float)$amount,3);
	}
	
	public function getDepositAddress($user)
	{
		return $bitcoin->getaccountaddress($user->username);
	}
	
	public function withdraw($user,$amount)
	{
		if(getbalance($user)<$amount)
			throw new exception("User is trying to withdraw more than they have!");
		return $bitcoin->sendfrom($user->username,$user->bcAddress,(float)$amount,3,"UBCCasino","UBCCasino");
	}
	
	public function getTransaction($txid)
	{
		return $bitcoin->gettransaction($txid);
	}
	
	public function listTransactions($user,$cnt=10)
	{
		return $bitcoin->listtransactions($user,$cnt);
	}
	
	public function getDifficulty()
	{
		return $bitcoin->getdifficulty();
	}
	public function getinfo()
	{
		return $bitcoin->getinfo();
	}
	
	public function listAccounts()
	{
		return $bitcoin->listaccounts();
	}
	
	
}


?>