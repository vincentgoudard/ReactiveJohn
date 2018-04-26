import { Meteor } from 'meteor/meteor';

import { Sequences, Lanes, Karmas, Nuances, TheTime } from '../imports/api/sequences.js';

const starline = "******************************************************"
console.log(starline);
console.log("Hello world, I am John's server and I print here!");
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
	Nuances.remove({});

	var myScoreFile = {};
	myScoreFile = JSON.parse(Assets.getText("sequences.json"));
	myScore = myScoreFile.score;
	myLanes = myScoreFile.lanes;
	console.log(myScore);
	console.log(myLanes);

	// add sample players
	//Lanes.insert({"lanes" : ["Pierre","Serge","Laurence", "Gyorgy", "Jean", "Hugues", "Vincent"]});
	Lanes.insert({"lanes" : myLanes});

	// add sample karmas and nuances
	Karmas.insert({"karmas" : ["Test", "Rebours", "Nuit", "Jour", "Agitato", "glissandi", "Presque rien", "4’33", "cosmique", "élastique", "pointilliste", "Doux","Valse","Sériel", "Explosif", "Aquatique", "Géologie sonore", "Vivace","Shuffling","Cristallin","Céleste", "Lointain", "Onomatopée", "à l'unison", "in C", "Cuivré", "En orbite", "mécanique"]});
	Nuances.insert({"nuances" : ["ppp", "pp", "p", "mp", "mf", "f", "ff", "fff"]});

	// add sample events
	for (var i=0; i<myScore.length; i++)
	Sequences.insert(myScore[i]);

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
			multicastOscSend(clientsIP, '/items/alive', [parseInt(item.lane), item.karma, item.nuance]);
		});
		multicastOscSend(clientsIP, '/items/alive', 'done');

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

import osc from 'osc-min';
// equivalent node.js syntax : osc = require('osc-min');
import dgram from 'dgram';
// equivalent node.js syntax : dgram = require("dgram");

var client = dgram.createSocket("udp4");
var host = 'localhost';
var outport = 7474;

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

