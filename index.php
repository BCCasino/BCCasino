<?
function JSONtoAmount($value) {
    return round(value * 1e8);
}
  require_once 'jsonRPCClient.php';

  $bitcoin = new jsonRPCClient('http://BCCasino:Qwerty123456@127.0.0.1:8332/');

  echo "<pre>\n";
  print_r($bitcoin->getaccountaddress("test"));
  echo "\n";
  print_r($bitcoin->getbalance("test",3));
  echo "\n";
  echo "Received: ".$bitcoin->getreceivedbyaddress("18BMfDnLKrFP4xPAAPU7cF87fzQ4oEmnxE")."\n";
  echo "</pre>"
?>
