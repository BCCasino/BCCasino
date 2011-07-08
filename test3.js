var sys = require('sys')
var Bitcoin =require('bitcoin');
var Client= new Bitcoin.Client('localhost', 8332, 'bitcoin', 'Qwerty123456');
Client.getAccountAddress("",function(err,add){
console.log("ADDRESS: "+add);
});
Client.getBalance("",0,function(err,add){
console.log("Balance: "+add);
});
Client.listAccounts(0,function(err,acc)
{
console.log("Accounts: "+sys.inspect(acc));
});
