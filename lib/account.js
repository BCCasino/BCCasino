require('./random.js');
require('hash');
var sys = require('sys')
Class('Account',{
	has: {
		Secret: {
			is: "rw",
			init: 0
		},
		Bitcoin: {
			is: "rw"			
		},
		Client: {
			is: "rw"		
		},
		socket: {
			is:"rw"
		},
		Log: {
			is:"rw"
		}
	},
	methods: {
		balance: function(callback,confirms){
			console.log("getting Balance");
			if(confirms===undefined)
				confirms=0;			
			this.getClient().getBalance(this.getSecret(),confirms,function(err,ret){					
				callback(ret);
			});
		},
		getAddress: function(callback) {
		var self=this;
			this.getClient().getAccountAddress(this.getSecret(),function(err,ret){
				console.log("Got address: "+err+", "+ret);
				self.getLog().log(self.getSecret(),"Got Address: "+ret);
				callback(ret);
			})			
		},
		credit: function(amt){
			amt=parseFloat(amt);
			console.log("Credit: "+amt);
			this.getLog().log(this.getSecret(),"Credit: "+amt);
			this.getClient().move("",this.getSecret(),amt,0,function(err){})
		},
		debit: function(amt){
			this.getLog().log(this.getSecret(),"Debit: "+amt);
			amt=parseFloat(amt);
			console.log("Dedit: "+amt);
			this.getClient().move(this.getSecret(),"",amt,0,function(err){})
		},
		withdraw: function(address,amount){
			var self=this;
			this.getLog().log(this.getSecret(),"Requested withdraw");
			this.getWithdrawableBalance(function(bal){			
				self.getLog().log(self.getSecret(),"Withdrawing: "+amount+" of "+bal);
				if(bal<amount)//only what they are allowed to withdraw
					amount=bal;
				if(amount <0 || bal<0)
					return;
				
				amount=parseFloat(amount);				
				self.getClient().sendFrom(self.getSecret(),address,amount,0,'','TheBitcoinWheel',function(err){
					if (err) self.getSocket().emit("exception","Error withdrawing: "+err);
					self.balance(function(balnow){
						if(balnow <0)
						{
							self.credit(balnow);
						}
						self.balance(function(finbal){
							props.socket.emit('Balance',finbal);
						});
					},0);
				});
			});
		},
		getWithdrawableBalance: function(callback) {
			this.balance(callback,6);
		},
		listTransactions: function(callback) {
			this.getClient().listTransactions(this.getSecret(),100,function(err,trans){callback(trans);});
		},
		win: function(amount,bet)
		{
			this.getLog().log(this.getSecret(),"Won a bet on "+bet+" for "+amount);
			this.getSocket().emit("win",{amount:amount,bet:bet});
		},
		loose: function(amount,bet)
		{
			this.getLog().log(this.getSecret(),"Lost a bet on "+bet+" for "+amount);
			this.getSocket().emit("loose",{amount:amount,bet:bet});
		},
		LogMsg: function(msg)//used in bigsix
		{
			this.getLog().log(this.getSecret(),msg);
		}
	},
	after: {
		initialize: function(props) {
			this.setLog(props.log);
			console.log(sys.inspect(props));
			this.setSocket(props.socket);
			var self = this;
			props.socket.on('getDepositAddress',function(){ 
				console.log("Get deposit address...");	
					self.getAddress(function(addr){
						props.socket.emit('DepositAddress',addr);	
					});
				});
			props.socket.on('getBalance',function(){
				console.log("getBalance");
				self.balance(function(amt){
					props.socket.emit('Balance',amt);
				});
			});
			props.socket.on('getWithdrawableBalance',function(){
				console.log("getWithdrawableBalance");
				self.getWithdrawableBalance(function(amt){
					props.socket.emit('WithdrawableBalance',amt);
				});
			});
			props.socket.on('getSecret',function(){
				console.log('secret requested');
				props.socket.emit('Secret',self.getSecret());
			});
			props.socket.on('withdraw',function(msg){
				console.log('Withdraw Requested for '+msg.amount+' to '+msg.address);
				self.withdraw(msg.address,msg.amount);
			});
			this.setBitcoin(require('bitcoin'));
			this.setClient(new (this.getBitcoin()).Client('localhost', 8332, 'bitcoin', 'Qwerty123456'));
			if(props.secret === undefined)
			{
				var foo = new Date; // Generic JS date object
				var unixtime_ms = foo.getTime();
				var salt = props.BS.salt();
				this.setSecret(Hash.sha256(unixtime_ms+salt));
				this.getClient().getNewAddress(this.getSecret(),function(err,ret){});
			}	
			else
			{
				this.setSecret(props.secret);
			}		
		}
	}
});