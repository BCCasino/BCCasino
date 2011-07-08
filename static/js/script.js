var Wheel = {
	currentDeg: 0,
	currentSlice: 0,
	spinToSlice: function(slice, callback) {
		var sliceDeg = 360 - (slice * 6.923);
		var nextZero = Math.ceil(this.currentDeg / 360) * 360
		var targetDeg = nextZero + sliceDeg + ((Math.floor((Math.random() * 3)) + 3) * 360);
		
		this.currentDeg = targetDeg;
		this.currentSlice = slice;
		
		$("#wheel").css("-webkit-transform", "scale(1) rotate(" + targetDeg + "deg) translate(0px, 0px) skew(0deg, 0deg)");
		setTimeout(function() {
			callback();
		}, 10000);
	}
};

$(document).ready(function() {
	// socket.io specific code
	var socket = io.connect(null,{rememberTransport: false});
	var socket2;
	socket.on('connect', function () {
		//We're connected, but who gives a fuck we aint in a room yet
	});

	socket.on('JoinRoom',function(msg){
		//We're in a room mothafucka, let's display this on the page somewhere okay? fuck you.
		
		socket2 = io.connect(msg);
		socket2.on('connect', function() {
		 socket2.emit('join',{/*secret*/});
		 message('System','Joined room: '+msg);
		  socket2.on('spin',function(msg){
		    message('System','Spin: '+msg.spin+', salt: '+msg.salt);
		  });
		  socket2.on('newHash',function(msg){
		    message('System','Hash: '+ msg.hash);
		 });
		  socket2.on('timeLeft',function(msg){
		   message('System','Time Left: '+msg);
		 });
		  socket2.on('DepositAddress',function(msg) {
		   message('System','Deposit Address: ' +msg);
		});
		  socket2.on('Balance',function(msg) {
		   message('System','Balance: '+msg);
		 });
		  socket2.on('Secret',function(msg){
		   message('System','Secret: '+msg);
		 });
		 setInterval(function() { 
		    socket2.emit('timeLeft');
		   },1000);
		 })
	});

	socket.on('error', function (e) {
	  message('System', e ? e : 'A unknown error occurred');
	});
});