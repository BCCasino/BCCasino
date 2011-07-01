var events = require('events');
require('./bigsix.js');
require('./account.js');
module.exports=Room;

function Interval (callback,delay)
{
	var id,start,remaining=delay;
	this.timeLeft=function(){
		return new date()-start;
	}
	this.stop = function() {
		clearInterval(this.id);
		this.id=0;
	}
	this.reset = function() {
		if(id!=0)
			clearInterval(this.id);
		start();
	}
	this.start = function() {
		start=new date();
		id=setInterval(callback,remaining);
	}
	this.start();
}


Room.prototype = new events.EventEmitter();
function Room()
{
	this.players = [];
	this.bets = true;
	this.bigSix =  new BigSix();
	//rounds last one minute unless everyone is ready sooner
	this.interval = new Interval(function(){ this.roundGo(); },60000);
}
Room.prototype.roundGo = function() {
	this.interval.stop();
	this.noMoreBets();
	this.bigSix.payBets(); // this also notifies player of win/loose
	this.resumeBets();
	this.interval.reset();
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
	var player = this.findPlayer(socket);
	this.bigSix.placeBet(player.account,data.bet,data.amount,function(sucess){
		player.socket.emit("bet",{ok:success});
	});
}
Room.prototype.broadcast = function(msg)
{
	for(var x in this.players)
	{
		x.socket.emit(msg);
	}
}
Room.prototype.findPlayer = function(socket){
	for(var x in this.players)
	{
		if(x.socket == socket)
		{
			return x;
		}
	}
	return undefined;
}
Room.prototype.ready = function(socket){
	this.findPlayer(socket).ready =true;
	if(this.checkAllReady())
		roundGo();
}
Room.prototype.checkAllReady = function() {
	for(var x in this.players){
		if(!x.ready)
			return false;
	}
	return true;
}
Room.prototype.numberOfPlayers = function() {
	return this.players.length;
}
Room.prototype.join = function(socket,account) {
	this.players.push({socket:socket,account:account,ready:false});
	socket.on('ready',function(data){ this.ready(socket); });
	socket.on('bet',function(data){this.bet(socket,data); });
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