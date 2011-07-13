require('joose');
require('joosex-namespace-depended');
require('hash');
require('./random.js');
var sys = require('sys')
Class('BigSixWheel',{
	has: {
		Wheel: {
			is: "ro",
			init: ["joker","1","2","1","2","5","2","1","2","1","10","2","5","1","2","1","20","1","5","1","2","1","5","1","2","1","flag","1","5","1","2","1","10","1","2","1","5","1","2","1","20","1","2","1","2","1","5","1","10","1","2","1" ]
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
		},
		Log: {
			is:"rw"
		}
	},
	methods: {
		spin: function() {
			var spin = Math.floor(Math.random()*52); 
			this.setSpun([spin,this.spinHash(spin)]);
			this.getLog().log('none','Spun: '+spin+', hash: '+this.getSpun()[1]);
			return this.getSpun(); 	
		},
		spinHash: function(spin) {
			var salt = "_" + this.salt();
			return [Hash.sha256(spin+"_"+salt),salt];
		},
		maxBet: function(callback) {
			this.getClient().getBalance("",function(err,bal) {
				require('util').debug("Balance "+bal);
				var max = (bal/3)/40;
				callback(Math.min(max,1));
			});
		},
		getPlayersBets: function(Account) {
			var b = this.getPlayedBets();
			var z = [];
			var amt =0;
			for(var x in b)
			{
				if(b[x][0]==Account)
				{
					z.push([b[x][1],b[x][2]]);
					amt+=b[x][2];
				}
			}
			return [z,amt];
		},
		removeAllBets: function(Account) {	
			Account.LogMsg("Removing all bets!");
			var b = this.getPlayedBets();
			for(var x in b)
			{
				if(b[x][0]==Account)
				{
					b.splice(x--,1);
				}
			}
		},
		removeBet: function(Account,bet,amount,callback) {
			var found = false;
			for(var x in this.getBets())
			{
				if(x==bet)
				{
					found=true;									
					break;
				}
			}
			if(!found)
			{
				Account.LogMsg("Caught hacking, trying to remove invalid bet type!");
				Account.getSocket().emit("hacks","Sorry bob, we cant allow that.");
				callback(found,this.getPlayersBets(Account)[0]);
				return;
			}
			found=false;
			if (amount >= 0) {
				var b = this.getPlayedBets();
				for(var x in b)
				{
					if(b[x][0]==Account && b[x][1]==bet)
					{
						b[x][2]-=parseFloat(amount);
						if(b[x][2]<=0)
							b.splice(x--,1);
						found=true;
						break;
					}			
				}
			}
			Account.LogMsg("Removed bet on "+bet+" for "+amount+" was successful: "+found);
			var z = this.getPlayersBets(Account)[0];
			callback(found,z);
			if(!found)
				Account.getSocket().emit('exception',"Couldn't find bet.");
		},
		placeBet: function(Account,bet,amount,callback) {
			var self = this;
			this.maxBet(function(max) {
				console.log("MAX BET: "+max);
				console.log("Account: "+sys.inspect(Account));
				Account.LogMsg("Placing bet on "+bet+" for "+amount);
				if(amount < max && amount >= 0)
				{
					Account.balance(function(bal) {
						console.log("Betters Balance: "+bal)
						if(amount <= bal) //player has enough money
						{
							var found =false 
							var bets = self.getPlayedBets();
							var playersBets = self.getPlayersBets(Account);
							if(playersBets[1]+amount >bal)
							{	//Prevent double spending...				
								Account.getSocket().emit('exception',"Insufficient funds");
								Account.LogMsg("Placing bet on "+bet+" for "+amount + ", Insufficient Funds");
								callback(false,self.getPlayersBets(Account)[0]);
								return;
							}					
							if(playersBets[1]+amount>max)
							{
								Account.getSocket().emit('exception',"Total bets exceed max bet.");
								callback(false,self.getPlayersBets(Account)[0]);
								return;
							}		
							for(var x in self.getBets())
							{
								if(x==bet)
								{
									found=true;									
									break;
								}
							}
							if(!found)
							{
								Account.LogMsg("Caught hacking, trying to place a bet on invalid tile");
								Account.getSocket().emit("hacks","I see your trying to play a new type of bet, OK.");
							}
							found=false;
							console.log("about to check existing bets to increment or create new: "+sys.inspect(bets));
							for(var x in bets)
							{
								if(bets[x][0]==Account && bets[x][1]==bet)
								{
									bets[x][2]+=parseFloat(amount);
									found=true;
									break;
								}
								
							}
							if(!found)
								self.getPlayedBets().push([Account, bet,parseFloat(amount)]);
							callback(true,self.getPlayersBets(Account)[0]);
							Account.LogMsg("Placing bet on "+bet+" for "+amount + ", done");
						}
						else
						{
							Account.LogMsg("Placing bet on "+bet+" for "+amount + ", Insufficient Funds");
							Account.getSocket().emit('exception',"Insufficient funds");
							callback(false,self.getPlayersBets(Account)[0]);							
						}
					});
				}
				else
				{
					Account.getSocket().emit('exception',"Bet must be greater than zero, and less than the max bet");
					callback(false,self.getPlayersBets(Account)[0]);
				}
			});
		},
		payBets: function() {
			console.log("Bets: "+sys.inspect(this.getPlayedBets()));
			console.log("Spin: "+sys.inspect(this.getSpun()));
			var winningBet = this.getWheel()[this.getSpun()[0]];
			this.getLog().log("none","Paying Bets for winning bet of "+this.getWheel()[this.getSpun()[0]]);
			for(var x =0;x<this.getPlayedBets().length;x++)
			{
				//pay bet if a winner/take money
				var bet = this.getPlayedBets()[x];
				console.log ("BET: "+bet[1] +" winner: "+winningBet)
				if(bet[1]==winningBet)
				{//winner, winner, chicken dinner
					var amountWon = bet[2]*this.getBets()[bet[1]];
					console.log("WINNER: "+amountWon);
					bet[0].credit(amountWon);
					//you won your bet+the payout (ie for even money you won 2)	 
					bet[0].win(amountWon,bet[1]);
				}
				else
				{//try again next time
					console.log("LOOSER: "+bet[2]);
					bet[0].debit(bet[2]);
					bet[0].loose(bet[2],bet[1]);
					this.getPlayedBets().splice(x--,1);//clear the loosing bet
				}
			}
		},
		seed: function() {
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
		salt: function() {
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
			this.setLog(props);
			this.setBets({"1":1,"2":2,"5":5,"10":10,"20":20,"flag":40,"joker":40});
			this.setBitcoin(require('bitcoin'));
			this.setClient(new (this.getBitcoin()).Client('localhost', 8332, 'bitcoin', 'Qwerty123456'));
			this.seed();
		}
	}
});
