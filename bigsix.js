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
		var max = (bal/3)/45;
		callback(max);
});
};
