var Wheel = [ 40,2,1,2,5,2,1,2,1,10,2,5,1,2,1,20,1,5,1,2,1,5,1,2,1,40,1,5,1,2,1,10,1,2,1,5,1,2,1,20,1,2,1,2,1,5,1,10,1,2 ];
var Bets = [1,2,5,10,20,40];

var Bets = [];

exports.Spin =function() {
		return Math.floor(Math.random()*52)+1;
	}; 
exports.SpinHash = function(spin) { 
var salt = "";
var chars = "0123456789ABCDEF";
	for(var x=0;x<40;x++)
{
	var n = Math.floor(Math.random()*chars.length);
	salt+=chars.substring(n,n+1);
}
return [Hash.sha512(spin+salt),salt];
};


var bitcoin = require('bitcoin');
var client = new bitcoin.Client('localhost', 8332, 'bitcoin', 'Qwerty123456');
require('joose')
    require('joosex-namespace-depended')
    require('hash')

exports.MaxBet = function(callback) {
	client.getBalance("",function(err,bal) {
		require('util').debug("Balance "+bal);
		var max = (bal/3)/40;
		callback(max);
});
};

exports.PlaceBet = function(secret,bet,amount,callback) {
	exports.MaxBet(function(max) {
		if(amount < max)
		{
			Bets.push(secret,[bet,amount]);
			callback(true);
		}
		else
			callback(false);
	});
}