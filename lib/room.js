var events = require('events');
require('./bigsix.js');
require('./account.js');
var sys = require('sys')
module.exports=Room;

function Interval (callback,delay)
{
	var id,starttime,running;
	this.timeLeft=function(){
		if(!this.running)
		return 0;
		var current = new Date().valueOf();
		var dif = delay-(current-this.starttime);
		return dif;
	}
	this.stop = function() {
		this.running=false;
		clearInterval(this.id);
		this.id=0;
	}
	this.reset = function() {
		if(this.id!=0)
			clearInterval(this.id);
		this.start();
	}
	this.start = function() {
		this.running=true;
		this.starttime=new Date().valueOf();
		this.id=setInterval(callback,delay);
	}
	this.start();
}
function Room(io,channel){
	var self = this;
	this.spun=true;
	this.io = io;
	this.channel=channel;
	this.bigSix =  new BigSixWheel();
	this.bigSix.spin();
//	console.log("BS: "+sys.inspect(this.bigSix));
	this.comm = io.of(channel).on('connection',function(socket){
		socket.on('disconnect', function () {
		    self.leave(socket);
		  });
		socket.on('join',function(msg){
			var acct;
			if(msg.secret === undefined)
				acct=  new Account({socket:socket,BS:self.bigSix});
			else
				acct= new Account({socket:socket,BS:self.bigSix,secret: msg.secret});
			self.join(socket,acct);	
		});	
	});
	this.players = [];
	this.bets = true;

	var self = this;
	//rounds last one minute unless everyone is ready sooner
	this.interval = new Interval(function(){ self.roundGo(); },60000);
	events.EventEmitter.call(this);
}

Room.prototype.getChannel = function() {
	return this.channel;
}
Room.prototype.roundGo = function() {
	this.interval.stop();
	this.noMoreBets();
	var lspin =this.bigSix.getSpun();
	console.log("SPIN: "+lspin[0]+" - Winning Bet: "+this.bigSix.getWheel()[lspin[0]]);
	this.broadcast('spin',{spin: lspin[0],salt: lspin[1][1]});
	this.bigSix.payBets(); // this also notifies player of win/loose
	this.spun=false;
	var self = this;
	clearTimeout(this.newHashInterval);
	this.newHashInterval = setTimeout(function() { 
	 		var spin = self.bigSix.spin();
			self.broadcast('newHash',{hash: spin[1][0]});
			self.spun=true;
			self.resumeBets();
			self.interval.reset();
		}, 10000);

}
Room.prototype.noMoreBets = function()
{
	this.broadcast("noMoreBets");
	this.bets=false;
}
Room.prototype.resumeBets = function()
{
	this.bets=true;
	this.broadcast("resumeBets");
}
Room.prototype.bet = function(socket,data)
{
	if(!this.bets)
		return;
	var player = this.findPlayer(socket);
	this.bigSix.placeBet(player.account,data.bet,data.amount,function(sucess){
		player.socket.emit("bet",{ok:sucess});
	});
}
Room.prototype.broadcast = function(msg,content)
{
	for(var x in this.players)
	{
		this.players[x].socket.emit(msg,content);
	}
}
Room.prototype.findPlayer = function(socket){
	for(var x in this.players)
	{
		if(this.players[x].socket == socket)
		{
			return this.players[x];
		}
	}
	return undefined;
}
Room.prototype.ready = function(socket){
	//stop them from going ready too fast
	if(!this.spun)
		return;
	this.findPlayer(socket).ready =true;
	if(this.checkAllReady())
		this.roundGo();
}
Room.prototype.checkAllReady = function() {
	for(var x in this.players){
		
		if(!this.players[x].ready){
			console.log("found a not ready player!");
			return false;
		}
	}
	console.log("all players ready!");
	return true;
}
Room.prototype.numberOfPlayers = function() {
	return this.players.length;
}

Room.prototype.roundTimeLeft = function(socket) {
//	console.log("timeleft: "+ sys.inspect(this.interval));
	var timeLeft = this.interval.timeLeft();
	socket.emit('timeLeft',timeLeft);
}

Room.prototype.getHash = function(socket) {
	var s = this.bigSix.getSpun();
	socket.emit('hash',{hash: spin[1][0]});
}

Room.prototype.chat = function(socket,message)
{
	var p = this.findPlayer(socket);
	socket.broadcast('message',{from: this.players.indexOf(p),message: message});
}

Room.prototype.join = function(socket){
	this.bigSix.maxBet(function(mb){
		socket.emit("maxbet",mb);
	})
}

Room.prototype.join = function(socket,account) {
	this.players.push({socket:socket,account:account,ready:false});
	var self = this;
	socket.on('ready',function(data){ self.ready(socket); });
	socket.on('bet',function(data){ self.bet(socket,data); });
	socket.on('timeLeft',function(){ self.roundTimeLeft(socket); })
	socket.on('getHash',function(){self.getHash(socket);});
	socket.on('getmaxbet',function(){self.getmaxbet(socket);});
	socket.on('message',function(data){self.chat(socket,message);});
	var spin = this.bigSix.getSpun();
	socket.emit('newHash',{hash: spin[1][0]})
	self.roundTimeLeft(socket);
}
Room.prototype.leave = function(socket){
	for(var x=0;x<this.players.length;x++)
	{
		if(this.players[x].socket == socket)
		{
			this.players.splice(x,1);
			break;
		}
	}
}