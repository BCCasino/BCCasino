var Wheel = [ "flag","1","2","1","2","5","2","1","2","1","10","2","5","1","2","1","20","1","5","1","2","1","5","1","2","1","joker",
"1","5","1","2","1","10","1","2","1","5","1","2","1","20","1","2","1","2","1","5","1","10","1","2","1" ];
var Bets = {"1":1,"2":2,"5":5,"10":10,"20":20,"flag":40,"joker":40};

var PlayedBets = [];
var spun = -1;

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
		callback(Math.min(max,1));
});
};

exports.PlaceBet = function(secret,bet,amount,callback) {
	exports.MaxBet(function(max) {
		if(amount < max)
		{
			client.getBalance(secret,function(err,bal) {
				if(amount <=bal) //player has enough money
				{
					PlayedBets.push([secret, bet,amount]);
					callback(true);
				}
				else
					callback(false);
			}
		}
		else
			callback(false);
	});
}

exports.PayBets = function() {
	var winningBet = Wheel[spun];
	for(var x =0;x<PlayedBets.length;x++)
	{
		//pay bet if a winner/take money
		var bet = PlayedBets[x];
		if(bet[1]==winningBet)
		{//winner, winner, chicken dinner
			var amountWon = bet[2]*Bets[bet[1]];
			client.move("",bet[0],amountWon,function(err) { });
		}
		else
		{//try again next time
			client.move(bet[0],"",bet[2],function(err) {});
		}
	}
}