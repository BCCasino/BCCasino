//setup Dependencies
require(__dirname + "/lib/setup").ext( __dirname + "/lib").ext( __dirname + "/lib/express/support");
require(__dirname + "/lib/bigsix.js");
var connect = require('connect')
    , express = require('express')
    , sys = require('sys')
    , io = require('Socket.IO-node')
    , port = (process.env.PORT || 8081)
	, bitcoin = require('bitcoin');

//Setup Express
var server = express.createServer();
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

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.ejs', { locals: { 
                  footer: ''
                 ,title : '404 Not Found'
                },status: 404 });
    } else {
        res.render('500.ejs', { locals: { 
                  footer: ''
                 ,title : 'The Server Encountered an Error'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.on('connection', function(client){
	console.log('Client Connected');
	
	client.on('message', function(message){
		client.broadcast(message);
		client.send(message);
	});
	client.on('disconnect', function(){
		console.log('Client Disconnected.');
	});
});

//Setup Bitcoin stuff & wheel stuff
var bs = new BigSixWheel();

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req, res) {
/*	bs.MaxBet(function(mb) {
		res.render('index.ejs', {
			locals : { 
				footer: ''
				,title : 'Home - Max Bet: ' + mb
			}
		});
	});*/
	res.render('index.ejs', {
		locals : { 
			footer: ''
			,title : 'Home'
		}
	});
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
