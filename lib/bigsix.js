require('joose');
require('joosex-namespace-depended');
require('hash');
require('./random.js');
Class('BigSixWheel',{
	has: {
		Wheel: {
			is: "ro",
			init: ["flag","1","2","1","2","5","2","1","2","1","10","2","5","1","2","1","20","1","5","1","2","1","5","1","2","1","joker","1","5","1","2","1","10","1","2","1","5","1","2","1","20","1","2","1","2","1","5","1","10","1","2","1" ]
		},
		Bets: {
			is: "rw"			
		},
		PlayedBets: {
			is: "rw",
			init: []
		},
		Spun: {
			is: "rw",
			init: -1
		},
		Bitcoin: {
			is: "rw"			
		},
		Client: {
			is: "rw"		
		}
	},
	methods: {
		Spin: function() {
			var spin = Math.floor(Math.random()*52); 
			this.setSpun([spin,this.SpinHash(spin)]);
			return this.getSpun(); 	
		},
		SpinHash: function(spin) {
			var salt = this.Salt();
			return [Hash.sha512(spin+salt),salt];
		},
		MaxBet: function(callback) {
			Client.getBalance("",function(err,bal) {
				require('util').debug("Balance "+bal);
				var max = (bal/3)/40;
				callback(Math.min(max,1));
			});
		},
		PlaceBet: function(Account,bet,amount,callback) {
			exports.MaxBet(function(max) {
				if(amount < max)
				{
					Account.Balance(function(err,bal) {
						if(amount <=bal) //player has enough money
						{
							setPlayedBets(getPlayedBets().push([Account, bet,amount]));
							callback(true);
						}
						else
							callback(false);
					});
				}
				else
					callback(false);
			});
		},
		PayBets: function() {
			var winningBet = this.getWheel()[this.getSpun()];
			for(var x =0;x<getPlayedBets().length;x++)
			{
				//pay bet if a winner/take money
				var bet = getPlayedBets()[x];
				if(bet[1]==winningBet)
				{//winner, winner, chicken dinner
					var amountWon = bet[2]*this.getBets()[bet[1]];
					bet[0].Credit(amountWon);
				}
				else
				{//try again next time
					bet[0].Debit(bet[2]);
				}
			}
		},
		Seed: function() {
			var https = require('https')
			var options = {
				host: 'query.yahooapis.com',		
				path: '/v1/public/yql?q=use%22http://davidbau.com/encode/srandom.xml%22;select*from%20srandom%20where%20nbytes%3D@nbytes;&format=json&diagnostics=false&callback=Math.seedrandom&nbytes=2048'
			}
			var request = https.get(options, function(res){
				var seed = '';
				res.on('data', function (chunk) {
					seed += chunk; 
				})
				res.on('end', function(){
					eval(seed);			
				});
			})
		},
		Salt: function() {
			var salt = "";
			var chars = "0123456789ABCDEF";
			for(var x=0;x<40;x++)
			{
				var n = Math.floor(Math.random()*chars.length);
				salt+=chars.substring(n,n+1);
			}
			return salt;
		}
	},
	after: {
		initialize: function(props) {
			this.setBets({"1":1,"2":2,"5":5,"10":10,"20":20,"flag":40,"joker":40});
			this.setBitcoin(require('bitcoin'));
			this.setClient(new (this.getBitcoin()).Client('localhost', 8332, 'bitcoin', 'Qwerty123456'));
			this.Seed();
		}
	}
});
