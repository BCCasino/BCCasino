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
			if (callback != null)
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
function htmlentities(value) {
    return jQuery('<div />').text(value).html();
}
function message(type, msg) {
	var msghtml = '<div class="chatMessage"><span class="messageType">' + htmlentities(type) + '</span><span class="messageTime">' + htmlentities((new Date().toLocaleTimeString())) + '</span><span class="message">' + htmlentities(msg) + '</span></div>';
	$("#chatMessages").append(msghtml);
	while ($("#chatMessages .chatMessage").size() > 100) {
		$("#chatMessages .chatMessage:first-child").remove();
	}
	$("#chatMessages").scrollTo($("#chatMessages .chatMessage:last-child"), 100);
	if (console)
		console.log(type + ": " + msg);
}
function displayBets(bets) {
	$("#bettingArea tbody tr:not(:last-child)").remove();
	for (var bet in bets) {
		var html = "<tr><td>" + bet[0] + "</td><td>" + bet[1] + "</td></tr>";
		$("#bettingArea tbody tr:last-child").before(html);
	}
	console.log(bets);
}
function updateBalances() {
	socket2.emit('getWithdrawableBalance');
	socket2.emit('getBalance');
}
function updateMax() {
	socket2.emit("getmaxbet");
}
var socket, socket2;
$(function() {
	$("#txtChat").keypress(function(e) {
		if (e.keyCode == 13) {
			socket2.emit('chatmessage', { message: $(this).val() });
			$(this).val("");
		}
	});
	$("#btnAddBet").click(function() {
		socket2.emit("bet", {
			bet: $("#ddBetZone").val(),
			amount: $("#txtBetAmount").val()
		});
	});
	
	// socket.io specific code
	socket = io.connect(null, { rememberTransport: false });
	socket.on('connect', function () {
		//not much to do here...
	});

	socket.on('JoinRoom',function(msg){
		Loader.hide();

		socket2 = io.connect(msg);
		socket2.on('connect', function() {
			var secret = window.location.hash.replace("#", "");
			if (secret != "")
				socket2.emit('join', {secret: secret});
			else
				socket2.emit('join', {});
			
			socket2.emit('getDepositAddress');
			socket2.emit('getSecret');
			
			$("#room").html(parseInt(msg.replace("/", "")) + 1)
			message('System','Joined room: ' + msg);
			
			socket2.on('spin',function(msg) {
				Wheel.spinToSlice(msg.spin);
				$("#spinToHash").html(msg.spin + msg.salt);
				message('System','Spin: ' + msg.spin + ', Salt: ' + msg.salt);
			});
			socket2.on('newHash',function(msg) {
				$("#spinHash").html(msg.hash);
				$("#spinToHash").html("");
				updateMax();
				message('System', 'Hash: ' + msg.hash);
			});
			socket2.on('timeLeft',function(msg) {
				var seconds = Math.round(parseInt(msg) / 1000);
				$("#timeLeft").html(seconds + " seconds");
			});
			socket2.on('DepositAddress',function(msg) {
				$("#depositAddress").html(msg);
				message('System', 'Deposit Address: ' + msg);
			});
			socket2.on('Balance',function(msg) {
				$("#ucbalance").html(msg);
			});
			socket2.on('WithdrawableBalance', function(msg) {
				$("#balance").html(msg);
			});
			socket2.on('Secret',function(msg) {
				window.location.hash = msg;
				message('System', 'Secret: ' + msg);
			});
			socket2.on("chatmessage", function(msg) {
				message('Chat', msg.message);
			});
			socket2.on("resumeBets", function(msg) {
				$("#bet-new-wrap .bet-zone, #bet-new-wrap .bet-amount, #bet-new-wrap #btnAddBet").removeAttr("disabled");
				updateBalances();
			});
			socket2.on("noMoreBets", function(msg) {
				$("#bet-new-wrap .bet-zone, #bet-new-wrap .bet-amount, #bet-new-wrap #btnAddBet").attr("disabled", true);
				updateBalances();
			});
			socket2.on("bets", function(msg) {
				displayBets(msg);
			});
			socket2.on("bet", function(msg) {
				if (msg.ok)
					message("System", "Bet placed successfully.");
				else
					message("System", "Something went wrong while placing your bet.");
				
				displayBets(msg.bets);
			});
			socket2.on("removeBet", function(msg) {
				if (msg.ok)
					message("System", "Bet removed successfully.");
				else
					message("System", "Something went wrong while removing your bet.");
				
				displayBets(msg.bets);
			});
			socket2.on("maxbet", function(msg) {
				message("System", "Max bet is " + msg + " BTC");
			})
			setInterval(function() { 
				socket2.emit('timeLeft');
			}, 1000);
			setInterval(function() {
				updateBalances();
			}, 20000);
		})
	});

	socket.on('error', function (e) {
		message('System', e ? e : 'An unknown error occurred');
	});
});