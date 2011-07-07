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
		}
	},
	methods: {
		balance: function(callback,confirms=0){
			this.getClient().getBalance(this.getSecret(),confirms,function(err,ret){
				callback(ret);
			});
		},
		getAddress: function(callback) {
			this.getClient().getAccountAddress(this.getSecret(),function(err,ret){
				console.log("Got address: "+err+", "+ret);
				callback(ret);
			})			
		},
		credit: function(amt){
			this.getClient().move("",this.getSecret(),amt,0,function(err){})
		},
		debit: function(amt){
			this.getClient().move(this.getSecret(),"",amt,0,function(err){})
		},
		withdraw: function(address,amount){
			this.getWithdrawableBalance(function(bal){
				if(bal<amount)
					bal=amount;
				this.getClient().sendFrom(this.getSecret(),address,bal,0,'','TheBitcoinWheel',function(err){});
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
			this.getSocket().emit("win",{amount:amount,bet:bet});
		},
		loose: function(amount,bet)
		{
			this.getSocket().emit("loose",{amount:amount,bet:bet});
		}
		
	},
	after: {
		initialize: function(props) {
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