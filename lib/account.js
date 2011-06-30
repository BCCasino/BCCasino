require('./random.js');
require('hash');
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
		}
	},
	methods: {
		Balance: function(callback){
			this.getClient().getBalance(this.getSecret(),0,function(err,ret){
				callback(ret);
			});
		},
		getAddress: function(callback) {
			this.getClient().getAccountAddress(this.getSecret(),function(err,ret){
				callback(ret);
			})			
		},
		Credit: function(amt){
			this.getClient().move("",this.getSecret(),amt,0,function(err){})
		},
		Debit: function(amt){
			this.getClient().move(this.getSecret(),"",amt,0,function(err){})
		},
		Withdraw: function(address){
			this.Balance(function(bal){
				this.getClient().sendFrom(this.getSecret(),address,bal,0,'','TheBitcoinWheel',function(err){});
			});
		},
		ListTransactions: function(callback) {
			this.getClient().listTransactions(this.getSecret(),100,function(err,trans){callback(trans);});
		}
	},
	after: {
		initialize: function(props) {
			this.setBitcoin(require('bitcoin'));
			this.setClient(new (this.getBitcoin()).Client('localhost', 8332, 'bitcoin', 'Qwerty123456'));
			if(props.secret === undefined)
			{
				var foo = new Date; // Generic JS date object
				var unixtime_ms = foo.getTime();
				var salt = props.BS.Salt();
				this.setSecret(Hash.sha256(unixtime_ms+salt));
				this.getClient().getNewAddress(this.getSecret(),function(err,ret){});
			}	
			else
			{
				this.setSecret(props.secret);
			}		
		}
	}