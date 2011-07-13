var Wheel = {
	currentDeg: 0,
	currentSlice: 0,
	spinToSlice: function(slice, callback) {
		var sliceDeg = 360 - (slice * 6.923);
		var nextZero = Math.ceil(this.currentDeg / 360) * 360
		var targetDeg = nextZero + sliceDeg + ((Math.floor((Math.random() * 3)) + 3) * 360);
		
		this.currentDeg = targetDeg;
		this.currentSlice = slice;
		
		$("#wheel").css("-webkit-transform", "scale(1) rotate(" + targetDeg + "deg) translate(0px, 0px) skew(0deg, 0deg)").css("-moz-transform", "scale(1) rotate(" + targetDeg + "deg) translate(0px, 0px) skew(0deg, 0deg)").css("-o-transform", "scale(1) rotate(" + targetDeg + "deg) translate(0px, 0px) skew(0deg, 0deg)").css("-ms-transform", "scale(1) rotate(" + targetDeg + "deg) translate(0px, 0px) skew(0deg, 0deg)").css("transform", "scale(1) rotate(" + targetDeg + "deg) translate(0px, 0px) skew(0deg, 0deg)");
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
		bet = bets[bet];
		var html = "<tr><td>" + bet[0] + "</td><td>" + bet[1] + "</td><td><input type='button' value='X' class='bet-remove button-small button-border button-red' /></tr>";
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
function updateBets() {
	socket2.emit("getBets");
}
var socket, socket2, maxbet;
$(function() {
	$("#txtChat").keypress(function(e) {
		if (e.keyCode == 13) {
			socket2.emit('chatmessage', { message: $(this).val() });
			$(this).val("");
		}
	});
	$("#btnReady").click(function() {
		socket2.emit("ready");
		$(this).removeClass("button-green").addClass("button-red").attr("disabled", "disabled").val("Readied!");
	});
	$("#btnAddBet").click(function() {
		var amt = parseFloat($("#txtBetAmount").val());
		if (amt == NaN || amt < 0 || amt > maxbet) {
			message("Error", "Invalid bet amount.");
			return;
		}
		var zone = $("#ddBetZone").val();
		if (zone == -1) {
			message("Error", "Invalid bet zone.");
			return;
		}
		socket2.emit("bet", {
			bet: zone,
			amount: amt
		});
	});
	$(".bet-remove").live("click", function() {
		var tds = $(this).parents("tr").find("td");
		var betZone = $(tds[0]).html();
		var betAmt = $(tds[1]).html();
		socket2.emit("removeBet", { bet: betZone, amount: betAmt });
	});
	$("#btnWithdraw").click(function() {
		var max = parseFloat($("#balance").html());
		var amt = parseFloat(prompt("How much do you want to withdraw? You can currently withdraw up to " + max + " BTC.", "0.00"));
		if (amt == NaN || amt <= 0 || amt > max) {
			message("Error", "Invalid withdraw amount.");
			return;
		}
		var addr = prompt("Please enter the address you want to withdraw to.", "");
		if (confirm("Are you sure you want to withdraw " + amt + " BTC to the address '" + addr + "'?")) {
			socket2.emit("withdraw", {
				amount: amt,
				address: addr
			});
		}
	}).hide();
	
	// socket.io specific code
	socket = io.connect(null, { secure: true, port: 443, rememberTransport: false, 'reopen delay': 1000 });
	socket.on('connect', function () {
		//not much to do here...
	});

	socket.on('JoinRoom',function(msg){
		Loader.hide();

		socket2 = io.connect(msg, {secure: true, port: 443, rememberTransport: false, 'reopen delay': 1000 });
		socket2.on('connect', function() {
			var secret = window.location.hash.replace("#", "");
			if (secret != "")
				socket2.emit('join', {secret: secret});
			else
				socket2.emit('join', {});
			
			socket2.emit('getDepositAddress');
			socket2.emit('getSecret');
			updateBalances();
			
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
				updateBets();
				$("#btnReady").removeClass("button-red").addClass("button-green").attr("disabled", "").val("Ready");
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
				var amt = parseFloat(amt);
				if (amt && amt >= 0.01)
					$("#btnWithdraw").show();
				
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
				displayBets(msg[0]);
			});
			socket2.on("bet", function(msg) {
				if (msg.ok)
					message("System", "Bet placed successfully.");
				
				displayBets(msg.bets);
			});
			socket2.on("removeBet", function(msg) {
				if (msg.ok)
					message("System", "Bet removed successfully.");
				
				displayBets(msg.bets);
			});
			socket2.on("maxbet", function(msg) {
				maxbet = parseFloat(msg);
				
				message("System", "Max bet is " + msg + " BTC");
			})
			socket2.on("exception", function(msg) {
				message("Error", msg);
			});
			socket2.on("win", function(msg) {
				message("System", "You just won a bet on " + msg.bet + " for " + msg.amount + " BTC, congratulations!");
			});
			socket2.on("loose", function(msg) {
				message("System", "You just lost a bet on " + msg.bet + " for " + msg.amount + " BTC, sorry :(.");
			});
			socket2.on("withdraw", function(msg) {
				message("System", "Withdrew funds successfully.");
			});
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