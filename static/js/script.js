var Wheel = {
	currentDeg: 0,
	currentSlice: 0,
	spinToSlice: function(slice) {
		var sliceDeg = 360 - (slice * 6.923);
		var nextZero = Math.ceil(this.currentDeg / 360) * 360
		var targetDeg = nextZero + sliceDeg + ((Math.floor((Math.random() * 2)) + 3) * 360);
		
		this.currentDeg = targetDeg;
		this.currentSlice = slice;
		
		$("#wheel").css("-webkit-transform", "scale(1) rotate(" + targetDeg + "deg) translate(0px, 0px) skew(0deg, 0deg)");
		setTimeout(function() {
			alert("Spin finished!");
		}, 10000);
	}
};

$(document).ready(function() {
	io.setPath('/client/');
	socket = new io.Socket(null, {
		port: 8081,
		transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling']
	});
	socket.connect();
	$('#sender').bind('click', function() {
		socket.send("Message Sent on " + new Date());     
	});
	socket.on('message', function(data){
		$('#reciever').append('<li>' + data + '</li>');  
	});
 });






















