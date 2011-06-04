<?php
	$bitcoin = new jsonRPCClient('http://BCCasino:Qwerty123456@127.0.0.1:8332/');
	$tis->bitcoin = $bitcoin;
//	print_r($bitcoin->sendfrom("Test","1JHQCpyRHc4vsNHsDYKS41pFTUAV299HgT",0.02));
//	$bitcoin->sendtoaddress("1JHQCpyRHc4vsNHsDYKS41pFTUAV299HgT",0.02);
	
	print_r($bitcoin->getaddressesbyaccount("Test"));
	echo "<br/>";
	print_r($bitcoin->getbalance("Test",0));
	echo "<br/>";
	print_r($bitcoin->getbalance("",0));
	echo "<br/>";
	print_r($bitcoin->move("Test","",(float)0.00000001));
	echo "<br/>";
	print_r($bitcoin->getbalance("Test",0));
	echo "<br/>";
	print_r($bitcoin->getbalance("",0));
	echo "<br/>";
	print_r($bitcoin->listtransactions("Test"));
?>
