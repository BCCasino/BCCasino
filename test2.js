/**
 * Bootstrap app.
 */
var sys = require('sys')
require.paths.unshift(__dirname + '/../../lib/');

/**
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , sio = require('socket.io');

/**
 * App.
 */

var app = express.createServer();

/**
 * App configuration.
 */

app.configure(function () {
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }))
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname);
  app.set('view engine', 'jade');

  function compile (str, path) {
    return stylus(str)
      .set('filename', path)
      .use(nib());
  };
});

/**
 * App routes.
 */

app.get('/', function (req, res) {
  res.render('index', { layout: false });
});

/**
 * App listen.
 */

app.listen(3000, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});

/**
 * Socket.IO server (single process only)
 */
var Room = require('./lib/room.js');
var io = sio.listen(app);
var rooms = [];
var rmchannel =0;
io.sockets.on('connection', function (socket) {
	var fnd = null;
	for(var r in rooms)
	{
		var n = rooms[r].numberOfPlayers();		
		if(n<5)
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
		fnd = new Room(io,'/'+rmchannel++);
		console.log("Room created: "+fnd.getChannel());
		socket.emit("JoinRoom",fnd.getChannel());
		rooms.push(fnd);
	}
});

//Setinterval and cleanup rooms every 5 minutes or so.