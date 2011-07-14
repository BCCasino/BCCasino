var https = require('https');
var fs = require('fs');
/**
 * Bootstrap app.
 */
var sys = require('sys')
require.paths.unshift(__dirname + '/../../lib/');

/**
 * Module dependencies.
 */

var express = require('express')
  , sio = require('socket.io'),
	connect = require('connect'),
	Room = require("./lib/room.js");
	
var port = 443;

/**
 * App.
 */
var privateKey = fs.readFileSync('../www.thebitcoinwheel.com.key').toString();
var certificate = fs.readFileSync('../www.thebitcoinwheel.com.crt').toString();
var ca = fs.readFileSync('../intermediate.crt').toString();

var server = express.createServer({key:privateKey,cert:certificate,ca:ca });
//var server = express.createServer();

//Setup Express
server.configure(function(){
    server.set('views', __dirname + '/views');
  	server.use(express.static(__dirname + '/static'));
    server.use(server.router);
});
server.configure('development', function(){
	server.use(express.errorHandler({ dumpExceptions: true, showStack: false }));
});
server.configure('production', function(){
	server.use(express.errorHandler());
});

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('*', function(req, res) {
	res.render('index.ejs', {
		locals : { 
			footer: ''
			,title : 'Home'
		}
	});
});
function login(secret)
{
console.log("Account logged in: "+secret);
if(Accounts.indexOf(secret)!=-1)
	return false;
	Accounts.push(secret);
	return true;
}
function logout(secret)
{
console.log("Account logged out: "+secret);
try{
	Accounts.splice(Accounts.indexOf(secret),1);
	}catch(err){
	Console.log("FAILED TO REMOVE ACCOUNT...");
	}
}

//SOCKET IO
//Setup Socket.IO
var io = sio.listen(server,{
	key: privateKey,
	cert: certificate,
	ca: ca,
	secure: true
});
//var io = sio.listen(server);
var rooms = [];
var Accounts = [];
var rmchannel = 0;
io.sockets.on('connection', function(socket) {
	console.log('Got a connection');
	var fnd = null;
	for(var r in rooms)
	{
		var n = rooms[r].numberOfPlayers();		
		if(n < 5)
		{
			fnd = rooms[r];
			console.log("Found a non-full room: "+fnd.getChannel());
			break;
		}
	}
	if(fnd!=null)
	{
		socket.emit("JoinRoom",fnd.getChannel());
	}
	else
	{
		fnd = new Room(io, '/' + rmchannel++,login,logout);
		console.log("Room created: " + fnd.getChannel());
		socket.emit("JoinRoom", fnd.getChannel());
		rooms.push(fnd);
	}
});

server.listen(port);

console.log('Listening on http://0.0.0.0:' + port );
