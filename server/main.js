import { Meteor } from 'meteor/meteor';

import { Sequences, Lanes, Karmas, TheTime } from '../imports/api/sequences.js';

const starline = "******************************************************"
console.log(starline);
console.log("Hello world, je suis le server meteor et je printe ici");
console.log(starline);
console.log();


// UDP server listening on port 7575
//	const dgram = require('dgram');
//	const server = dgram.createSocket('udp4');
//
//	console.log(dgram);
//	console.log("///",server);
//	
//	server.on('error', (err) => {
//	  console.log(`server error:\n${err.stack}`);
//	  server.close();
//	});
//	
//	server.on('message', (msg, rinfo) => {
//	  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
//	});
//	
//	server.on('listening', () => {
//	  var address = server.address();
//	  console.log(`server listening ${address.address}:${address.port}`);
//	});
//	
//	server.bind(7575);
//	// server listening 0.0.0.0:7575
//
//	var PORT = 7474;
//	var HOST = '127.0.0.1';
//	// sending UDP on port 7474
//	const message = new Buffer('/My KungFu is Good!');
//	const client = dgram.createSocket('udp4');
//	client.send(message, 0, message.length, PORT, HOST, (err) => {
//		client.close();
//	});

var clientsIP = [];
Meteor.onConnection(function(conn) {
	if (clientsIP.indexOf(conn.clientAddress) == -1) {
    	clientsIP.push(conn.clientAddress);
	}
    //console.log(conn);
    console.log('actives :', clientsIP);
    conn.onClose(function() {
    	// remove IP from list of active connection
    	var index = clientsIP.indexOf(conn.clientAddress);
    	if (index > -1) {
    		clientsIP.splice(index, 1);
		}
    	console.log('user left:', conn.clientAddress);
    });
});

Meteor.startup(() => {
  // code to run on server at startup

	// start from sratch
	Lanes.remove({});
	Sequences.remove({});
	Karmas.remove({});


	// add sample players
	Lanes.insert({"lanes" : ["Pierre","Serge","Laurence", "Gyorgy", "Jean", "Hugues", "Vincent"]});

	// add sample karmas
	Karmas.insert({"karmas" : ["Doux","Valse","Sériel", "Explosif", "Aquatique", "Géologie sonore", "Vivace","Shuffling","Cristallin","Céleste", "Lointain", "Onomatopée", "à l'unison", "in C", "Cuivré", "En orbite", "mécanique"]});

	var SampleEvents = [];
	//var SampleEvents = [{"lane": 0, "karma": "Doux", "start": 5, "end": 205},
	//			{"lane": 0, "karma": "Valse", "start": 265, "end": 420},
	//			{"lane": 0, "karma": "Sériel", "start": 580, "end": 615},
	//			{"lane": 0, "karma": "Explosif", "start": 620, "end": 900},
	//			{"lane": 1, "karma": "Aquatique", "start": 960, "end": 1265},
	//			{"lane": 1, "karma": "Géologie sonore", "start": 1270, "end": 1365},
	//			{"lane": 1, "karma": "blabla", "start": 1370, "end": 1640},
	//			{"lane": 1, "karma": "mécanique", "start": 1645, "end": 1910},
	//			{"lane": 2, "karma": "Céleste", "start": 300, "end": 530},
	//			{"lane": 2, "karma": "Vivace", "start": 550, "end": 700},
	//			{"lane": 2, "karma": "Lento", "start": 710, "end": 790},
	//			{"lane": 3, "karma": "à l'unison", "start": 800, "end": 1180},
	//			{"lane": 3, "karma": "in C", "start": 1190, "end": 1330},
	//			{"lane": 4, "karma": "crescendo", "start": 1340, "end": 1560},
	//			{"lane": 4, "karma": "shuffling", "start": 1610, "end": 1860},
	//			{"lane": 4, "karma": "désaccordé", "start": 1870, "end": 1900},
	//			{"lane": 5, "karma": "cuivres", "start": 1910, "end": 1920},
	//			{"lane": 5, "karma": "cristallin", "start": 1925, "end": 1985},
	//			{"lane": 5, "karma": "en orbite", "start": 1990, "end": 1995},
	//			{"lane": 5, "karma": "résonnance", "start": 10, "end": 670},
	//			{"lane": 5, "karma": "tremblement de terre", "start": 690, "end": 900},
	//			{"lane": 6, "karma": "lointain", "start": 920, "end": 1380},
	//			{"lane": 6, "karma": "chuchotement", "start": 1390, "end": 1890},
	//			{"lane": 6, "karma": "onomatopée", "start": 1900, "end": 1945}];

	// add sample events
	for (var i=0; i<SampleEvents.length; i++)
	Sequences.insert(SampleEvents[i]);

	var the_time = 0;
	var the_offset = Date.now();
	var delay_milliseconds = 100;

	var interval = setInterval(Meteor.bindEnvironment(function (err, res) {
		//TheTime.upsert('timer', {$set:{"time": the_time++}});
		var theTime = Date.now() - the_offset;
		TheTime.upsert('timer', {$set:{"time": theTime }});
		// console.log('actives :', clientsIP);

		// find active event
		var TheTimeColl = TheTime.find('timer').fetch()[0];
		var currentTime = (TheTimeColl.time - TheTimeColl.john_start) / 1000.;
		var activeItems = Sequences.find(
			{ 
				start: { $lt: currentTime },
				end: { $gt: currentTime }
			}).fetch();

		activeItems.forEach(function (item){
			multicastOscSend(clientsIP, '/items/alive', [parseInt(item.lane), item.karma]);
		});

		//console.log('currentTime: ', currentTime);
		//console.log(starline);
		//console.log('activeEvents: ', activeEvents);

	}), delay_milliseconds);

	Meteor.publish('john.public', function() {
	  return Sequences.find({});
	});

	// function that we can invoke from the client
	return Meteor.methods({
		removeAllSequences: function() {
			return Sequences.remove({});
		},
		removeSequences: function(selectionOfItems) {
			console.log('removing sequences : ', selectionOfItems);
			return Sequences.remove(selectionOfItems);
		}
	});
});


/****************
 * OSC Over UDP *
 ****************/

// var osc = require('osc');


//var getIPAddresses = function () {
//    var os = require("os"),
//        interfaces = os.networkInterfaces(),
//        ipAddresses = [];
//
//    for (var deviceName in interfaces) {
//        var addresses = interfaces[deviceName];
//        for (var i = 0; i < addresses.length; i++) {
//            var addressInfo = addresses[i];
//            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
//                ipAddresses.push(addressInfo.address);
//            }
//        }
//    }
//
//    return ipAddresses;
//};
//
//var udpPort = new osc.UDPPort({
//    localAddress: "0.0.0.0",
//    localPort: 57121
//});
//
//udpPort.on("ready", function () {
//    var ipAddresses = getIPAddresses();
//
//    console.log("Listening for OSC over UDP.");
//    ipAddresses.forEach(function (address) {
//        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
//    });
//});
//
//udpPort.on("message", function (oscMessage) {
//    example.mapOSCToSynth(oscMessage, example.synth, example.synthValueMap);
//});
//
//udpPort.on("error", function (err) {
//    console.log(err);
//});
//
//udpPort.open();
//


// DB cursor to detecte any change on sequences collection.
// found here http://stackoverflow.com/questions/10103541/how-does-meteor-receive-updates-to-the-results-of-a-mongodb-query
var mySequenceCursor = Sequences.find({});
// watch the cursor for changes
var mySequenceHandle = mySequenceCursor.observe({
  added: function (post) { multicastOscSend(clientsIP, '/items/add', post._id) }, // run when post is added
  changed: function (post) { multicastOscSend(clientsIP, '/items/changed', post._id)  }, // run when post is changed
  removed: function (post) { multicastOscSend(clientsIP, '/items/removed', post._id)  } // run when post is removed
});

var myTimeCursor = TheTime.find({});
var myTimeHandle = myTimeCursor.observe({
  changed: function (post) {
  	if(post.playing==true){
   		//console.log(post); 
  		multicastOscSend(clientsIP, '/time', (post.time - post.john_start));		
  	}
  }, // run when post is changed
});

//////////////////////////////
// Sending OSC with OSC-min //
//////////////////////////////

var dgram, osc, outport, sendHeartbeat, client;

osc = require('osc-min');
dgram = require("dgram");
client = dgram.createSocket("udp4");

outport = 7474;
host = 'localhost';

console.log("sending heartbeat messages to http://localhost:" + outport);


multicastOscSend = function(IPlist, zeAddress, zeArgs) {
  var buf;
  return IPlist.forEach(function(IP){
  	 buf = osc.toBuffer({
   	 	address: zeAddress,
    	args: zeArgs
  	});
  	client.send(buf, 0, buf.length, outport, IP);
  });
};


OscSend = function(zeAddress, zeArgs) {
  var buf;
  buf = osc.toBuffer({
    address: zeAddress,
    args: zeArgs
  });
  return client.send(buf, 0, buf.length, outport, host);
};

// send heartbeat to connected clients every 2 seconds
setInterval(function(){multicastOscSend(clientsIP, '/heartbeat')}, 2000);

