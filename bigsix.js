exports.Spin =function() {
		return Math.floor(Math.random()*52)+1;
	};
var bitcoin = require('bitcoin');
var client = new bitcoin.Client('localhost', 8332, 'bitcoin', 'Qwerty123456');

exports.MaxBet = function(callback) {
	client.getBalance("",function(err,bal) {
		require('util').debug("Balance "+bal);
		var max = (bal/3)/45;
		callback(max);
});
};
