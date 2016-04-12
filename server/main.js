import { Meteor } from 'meteor/meteor';

import { Sequences, Lanes, TheTime } from '../imports/api/sequences.js';

Meteor.startup(() => {
  // code to run on server at startup

	// start from sratch
	Lanes.remove({});
	Sequences.remove({});

	// add sample players
	Lanes.insert({"lanes" : ["Pierre","Serge","Laurence", "Gyorgy", "Jean", "Hugues", "Vincent"]});


	var SampleEvents = [{"lane": 0, "id": "Doux", "start": 5, "end": 205},
				{"lane": 0, "id": "Valse", "start": 265, "end": 420},
				{"lane": 0, "id": "Sériel", "start": 580, "end": 615},
				{"lane": 0, "id": "Explosif", "start": 620, "end": 900},
				{"lane": 1, "id": "Aquatique", "start": 960, "end": 1265},
				{"lane": 1, "id": "Géologie sonore", "start": 1270, "end": 1365},
				{"lane": 1, "id": "blabla", "start": 1370, "end": 1640},
				{"lane": 1, "id": "mécanique", "start": 1645, "end": 1910},
				{"lane": 2, "id": "Céleste", "start": 300, "end": 530},
				{"lane": 2, "id": "Vivace", "start": 550, "end": 700},
				{"lane": 2, "id": "Lento", "start": 710, "end": 790},
				{"lane": 3, "id": "à l'unison", "start": 800, "end": 1180},
				{"lane": 3, "id": "in C", "start": 1190, "end": 1330},
				{"lane": 4, "id": "crescendo", "start": 1340, "end": 1560},
				{"lane": 4, "id": "shuffling", "start": 1610, "end": 1860},
				{"lane": 4, "id": "désaccordé", "start": 1870, "end": 1900},
				{"lane": 5, "id": "cuivres", "start": 1910, "end": 1920},
				{"lane": 5, "id": "cristallin", "start": 1925, "end": 1985},
				{"lane": 5, "id": "en orbite", "start": 1990, "end": 1995},
				{"lane": 5, "id": "résonnance", "start": 10, "end": 670},
				{"lane": 5, "id": "tremblement de terre", "start": 690, "end": 900},
				{"lane": 6, "id": "lointain", "start": 920, "end": 1380},
				{"lane": 6, "id": "chuchotement", "start": 1390, "end": 1890},
				{"lane": 6, "id": "onomatopée", "start": 1900, "end": 1945}];

	// add sample events
	for (var i=0; i<SampleEvents.length; i++)
	Sequences.insert(SampleEvents[i]);


	var delay_milliseconds = 5;

	var interval = setInterval(Meteor.bindEnvironment(function (err, res) {
		TheTime.update('timer', {$set:{"time": 3}});

	}), delay_milliseconds);

	Meteor.publish('john.public', function() {
	  return Sequences.find({});
	});

});

