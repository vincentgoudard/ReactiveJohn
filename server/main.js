import { Meteor } from 'meteor/meteor';

import { Sequences, Lanes, Karmas, TheTime } from '../imports/api/sequences.js';

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
		TheTime.upsert('timer', {$set:{"time": ( Date.now() - the_offset )}});

	}), delay_milliseconds);

	Meteor.publish('john.public', function() {
	  return Sequences.find({});
	});

	// provide a function to remove all sequences
	return Meteor.methods({
		removeAllSequences: function() {
			return Sequences.remove({});
		}
	});

});
