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
		balance: function(callback){
			this.getClient().getBalance(this.getSecret(),0,function(err,ret){
				callback(ret);
			});
		},
		getAddress: function(callback) {
			this.getClient().getAccountAddress(this.getSecret(),function(err,ret){
				callback(ret);
			})			
		},
		credit: function(amt){
			this.getClient().move("",this.getSecret(),amt,0,function(err){})
		},
		debit: function(amt){
			this.getClient().move(this.getSecret(),"",amt,0,function(err){})
		},
		withdraw: function(address){
			this.Balance(function(bal){
				this.getClient().sendFrom(this.getSecret(),address,bal,0,'','TheBitcoinWheel',function(err){});
			});
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