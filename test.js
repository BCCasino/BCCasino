require('./lib/bigsix.js');
require('./lib/account.js');
require('./lib/room.js');
var bitcoin = require('bitcoin'); 
var client = new bitcoin.Client('localhost', 8332, 'bitcoin', 'Qwerty123456'); 
var bs = new BigSixWheel();
var results = new Object();
for(var x=0;x<500;x++){
	var spin = bs.spin()[0];
	if(results[bs.getWheel()[spin]] ===undefined)
		results[bs.getWheel()[spin]]=0;
	results[bs.getWheel()[spin]]++;
	//console.log("Spin "+x+": "+spin);	
}
console.log("BETS: "+bs.getBets().length);
for(var word in results)
	console.log("BET: "+word +" Count: "+results[word]);
var sys = require('sys')
client.listAccounts(function(err,ret)
{
	console.log("ListAccounts: "+sys.inspect(ret));
});

client.getBalance(function(err,ret)
{
	console.log("getBalance: "+sys.inspect(ret));
});
client.getBlockCount(function(err,ret)
{
	console.log("getBlockCount: "+sys.inspect(ret));
});
client.getGenerate(function(err,ret)
{
	console.log("getGenerate: "+sys.inspect(ret));
});
client.getBlockNumber(function(err,ret)
{
	console.log("getBlockNumber: "+sys.inspect(ret));
});
client.getConnectionCount(function(err,ret)
{
	console.log("getConnectionCount: "+sys.inspect(ret));
});
client.getAddressesByAccount("",function(err,ret)
{
	console.log("getAddressesByAccount: "+sys.inspect(ret));
});
