var events = require('events');
require('./bigsix.js');
require('./account.js');
var sys = require('sys')
module.exports=Logging;
var pg = require('pg');	

function Logging(connstr){
	
	this.connString=connstr;
	this.client = new pg.Client(this.connString);
	this.client.connect();
}

Logging.log = function(secret,message) {
	this.client.query("INSERT INTO logs (secret,message) VALUES ($1,$2)",[secret,message]);	
}