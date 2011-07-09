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
var Loader = {
	last: "#overlay-loading",
	show: function(overlay) {
		this.hide();
		
		overlay = "#overlay-" + overlay;
		$(overlay).fadeIn(250);

		this.last = overlay;
	},
	hide: function() {
		if (this.last)
			$(this.last).fadeOut(250);
		this.last = false;
	}
}

function message(t, v) {
	if (console)
		console.log(t + ": " + v);
}

$(function() {
	// socket.io specific code
	var socket = io.connect(null,{ rememberTransport: false });
	var socket2;
	socket.on('connect', function () {
		//not much to do here...
	});

	socket.on('JoinRoom',function(msg){
		Loader.hide();

		socket2 = io.connect(msg);
		socket2.on('connect', function() {
			var secret = window.location.hash;
			message("debug", secret);
			if (secret != "")
				socket2.emit('join', {secret: secret});
			else
				socket2.emit('join', {});
			socket2.emit('getDepositAddress');
			socket2.emit('getBalance');
			socket2.emit('getSecret');
			
			$("#room").html(parseInt(msg.replace("/", "")) + 1)
			message('System','Joined room: ' + msg);
			socket2.on('spin',function(msg) {
				Wheel.spinToSlice(msg.spin);
				$("#spinToHash").html(msg.spin + msg.salt);
				message('System','Spin: ' + msg.spin + ', salt: ' + msg.salt);
			});
			socket2.on('newHash',function(msg) {
				$("#spinHash").html(msg.hash);
				$("#spinToHash").html("");
				message('System', 'Hash: ' + msg.hash);
			});
			socket2.on('timeLeft',function(msg) {
				var seconds = Math.round(parseInt(msg) / 1000);
				$("#timeLeft").html(seconds + " seconds");
				message('System', 'Time Left: ' + msg);
			});
			socket2.on('DepositAddress',function(msg) {
				$("#depositAddress").html(msg);
				message('System', 'Deposit Address: ' + msg);
			});
			socket2.on('Balance',function(msg) {
				$("#balance").html(msg);
				message('System', 'Balance: ' + msg);
			});
			socket2.on('Secret',function(msg) {
				window.location.hash = msg;
				message('System', 'Secret: '+ msg);
			});
			setInterval(function() { 
				socket2.emit('timeLeft');
			}, 1000);
		})
	});

	socket.on('error', function (e) {
		message('System', e ? e : 'A unknown error occurred');
	});
});