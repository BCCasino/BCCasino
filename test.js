require('./bigsix.js');
var bitcoin = require('bitcoin'); 
var client = new bitcoin.Client('localhost', 8332, 'bitcoin', 'Qwerty123456'); 
var bs = new BigSixWheel();
console.log("First Spin: "+bs.Spin());
var express = require('express'); var jade = require('jade'); app = express.createServer(); app.get('/', 
function(req, res) {
	var local_var = "Balance: ";
		bigsix.MaxBet(function(mb) {
				
		
		jade.renderFile('index.jade', {locals:{spin:Spin,local_var:"Max Bet: "+mb}}, function(err, 
html){
			res.send(html);
		});
	});
});
app.listen();
console.log("Express server is started on port %s", app.address().port);
