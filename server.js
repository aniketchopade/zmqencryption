var zmq = require('zeromq'),
	z85 = require('z85'),
	debug = require('debug')('zmq-zap:examples:curve'),
	port = 'tcp://127.0.0.1:12345';

// public / private key pairs used to encrypt the data
// The clientPublicKey is also used for authentication
var serverKeypair = zmq.curveKeypair();
var serverPublicKey = serverKeypair.public,
	serverPrivateKey = serverKeypair.secret;
    
var clientPublicKey = "E>qdS40^fE5-CcVyU]tKru?N9W97UKVvNR/Q*fr<"
console.log("server public key is " + serverPublicKey );
console.log("server private key is " + serverPrivateKey );

// Requires for ZAP handler
var zmqzap = require('zmq-zap'),
	ZAP = zmqzap.ZAP,
	CurveMechanism = zmqzap.CurveMechanism;

// Create a new ZAP Handler
var zap = new ZAP();

// Tell it to use the CURVE mechanism for authentication
zap.use(new CurveMechanism(function(data, callback) {
	console.log('Authenticating %s', JSON.stringify(data, true, 2));

	// This is where you'd check to see if you want to let the socket connect.
	// The CURVE mechanism lets you authenticate based on domain and address and a pre-exchanged publickey.

	// For this example, let sockets connect where the "server" is in the "test" domain and the "client"'s address is "127.0.0.1"
	if ((data.domain == 'test') && (data.address == "127.0.0.1")) {
		// and where the publickey matches the one we have for the client
		if (data.publickey == clientPublicKey) callback(null, true);
		else callback(null, false);
	}
	else callback(null, false);
}));

// Setup ZeroMQ ZAP socket
// We'll use a router so that we can handle multiple requests at once
var zapSocket = zmq.socket('router');
zapSocket.on('message', function() {
	// When we get a message, send it through to the ZAP handler
	zap.authenticate(arguments, function(err, response) {
		if (err) console.error('Error:', err);
		
		// Always send the response if the handler gives us one in the callback.
		// This should be done even if there is an error so that we don't block any sockets.
		if (response) zapSocket.send(response);
	});
});

// The socket for the ZAP handler should be bound before creating any sockets that will use it.
// We'll use bindSync to make sure that the bind completes before we do anything else.
zapSocket.bindSync('inproc://zeromq.zap.01');



// Setup a rep "server"
// Although ZMQ doesn't typically think of sockets as "server" or "client", the security mechanisms are different in that there should always be a "server" side that handles the authentication piece.
var rep = zmq.socket('pub');
rep.identity = "rep-socket";

// Tell the socket that we want it to be a CURVE "server"
rep.curve_server = 1;
// Set the private key for the server so that it can decrypt messages (it does not need its public key)
rep.curve_secretkey = "@MOQ/V6MtH4Cj[Yw!F4IZfbe5142rfA6$Esjj#&7";
// We'll also set a domain, but this is optional for the CURVE mechanism
rep.zap_domain = "test";

// This is just typical rep bind stuff. 
// It'll look for a "hello" message and send back "world"

rep.bindSync(port);
console.log('Publisher bound ..');

setInterval(function(){
  console.log('sending a multipart message envelope');
  rep.send(['kitty cats', 'meow!']);
}, 500);

/*
rep.bind(port, function(err) {
    if (err) throw err;
	debug('rep bound');
    rep.on('message', function(data) {
		debug('rep received %s', data);
	    if (data == 'hello') rep.send('world');
		else {
			debug('unknown message: %s', data);
			req.send('huh?');
		}
    });
});
*/