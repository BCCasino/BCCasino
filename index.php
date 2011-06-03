<?
function JSONtoAmount($value) {
    return round(value * 1e8);
}
  require_once 'jsonRPCClient.php';

  $bitcoin = new jsonRPCClient('http://BCCasino:Qwerty123456@127.0.0.1:8332/');

  echo "<pre>\n";
  print_r($bitcoin->help()); echo "\n";
  echo "Received: ".$bitcoin->getreceivedbylabel("Your Address")."\n";
  echo "</pre>"
?>
