var zmq = require('zeromq'),
	z85 = require('z85'),
	port = 'tcp://127.0.0.1:12345';

// Setup a req "client"
// This will send a "hello" message once it connect and expect "world" back
// The example will exit after this receives a message
var req = zmq.socket('sub');
req.identity = "req-socket";
var clientKeypair = zmq.curveKeypair();
var 	clientPublicKey = clientKeypair.public,
	clientPrivateKey = clientKeypair.secret;



// Set the CURVE "client" public and private keys as well as the "server" public key
req.curve_publickey = "E>qdS40^fE5-CcVyU]tKru?N9W97UKVvNR/Q*fr<"
req.curve_secretkey = "kJdL@mOIQyJ%93J*puyzD@pU:[7<^$32RRu+tdmV";
req.curve_serverkey = "{lvAPpf%ro{dQIiBzBkh5]M0kX}SaN<>1Y7M1uo:";

req.connect(port);
req.subscribe('kitty cats');
console.log('req connected');
/*
req.send('hello');
console.log('req hello sent');
*/
req.on('message', function(topic, message) {
  console.log('received a message related to:', topic.toString(), 'containing message:', message.toString());
}); 
/*
req.on('message', function(data) {
	console.log('req received %s', data);
    if (data == 'world') console.log('success!');
	else console.log('unknown message: %s', data);
	process.exit();
});
*/