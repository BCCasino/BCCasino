require('./lib/bigsix.js');
var bitcoin = require('bitcoin'); 
var client = new bitcoin.Client('localhost', 8332, 'bitcoin', 'Qwerty123456'); 
var bs = new BigSixWheel();
var results = [];
for(var x=0;x<5000;x++){
	var spin = bs.Spin()[0];
	if(results[bs.getBets()[bs.getWheel()[spin]]] ===undefined)
		results[bs.getBets()[bs.getWheel()[spin]]]=0;
	results[bs.getBets()[bs.getWheel()[spin]]]++;
	console.log("Spin "+x+": "+spin);	
}
console.log("BETS: "+bs.getBets().length);
for(var y=0;y<bs.getBets().length;y++)
{
	console.log("BET: "+bs.getBets()[y] +" Count: "+results[bs.getBets()[y]]);
}
