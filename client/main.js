import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Sequences, Lanes, Karmas, TheTime }  from '../imports/api/sequences.js';

import '../imports/d3/d3.v2.js';
import { John } from '../imports/d3-timeline.js';

import './main.html';

var TheJohn;

karmas = [];

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

var kk = 0;
Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});


Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);  },
});


const handle = Meteor.subscribe('john.public');

Tracker.autorun(() => {
	const isReady = handle.ready();
	console.log(`Handle is ${isReady ? 'ready' : 'not ready'}`);

	if(isReady) {
		// get the lanes
		var lanesCollection = Lanes.find({}).fetch();
		var lanes = lanesCollection[0].lanes;

    // feed the lane Menu
    for (var i = 0; i < lanes.length; i++) {
      var myElement = "<option value=" + i + ">" + lanes[i] + "</option>";
      $( ".laneMenu" ).append( myElement );
    }

    // get the karmas
    var karmasCollection = Karmas.find({}).fetch();
    karmas = karmasCollection[0].karmas;
    //console.log(karmas);

    // feed the karma Menu(s)
    for (var i = 0; i < karmas.length; i++) {
      var myElement = "<option value=" + karmas[i] + ">" + karmas[i] + "</option>";
      $( ".karmaMenu" ).append( myElement );
    }

    // get the events
		var eventsCollection = Sequences.find({}).fetch();

    // create a view for timeline
		John.create(Sequences, lanes, eventsCollection, "#john_anchor_1", function(time){
			var currentTime = TheTime.find('timer').fetch();
			// inverse playing
			var playing = !currentTime[0].playing;

			TheTime.upsert('timer', {$set:{"john_start": time}});
			TheTime.upsert('timer', {$set:{"playing": playing}});
		});
	}
});

Tracker.autorun(() => {
	var currentTime = TheTime.find('timer').fetch();
	if(currentTime.length == 1) {
		John.setTime(currentTime[0].time, currentTime[0].john_start, currentTime[0].playing);
	}
});

Template.body.events({
  'submit .karma-edit'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    //console.log(John.items);
    // Get value from form element
    const target = event.target;
    const newKarma = target.karmaMenu.value;

    function editKarmaForSelectedItem(element) {
      if (element.selected){
        // element.karma = newKarma;
        Sequences.update({"_id":element._id}, {"lane":element.lane, "karma": newKarma, "start":element.start, "end":element.end });
      }
    }

    John.items.forEach(editKarmaForSelectedItem);


//    Sequences.insert({"lane": lane, "karma": karma, "start": start, "end": end});

    // Clear form
    target.karmaMenu.value = 'Doux';

  },
  'submit .new-event'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    //const text = target.text.value;
    const lane = Number(target.laneMenu.value);
    const karma = target.karmaMenu.value;
    const start = Number(target.start.value);
    const end = Number(target.end.value);

    //// Insert an event into the collection
    //Tasks.insert({
    //  text,
    //  createdAt: new Date(), // current time
    //});

    Sequences.insert({"lane": lane, "karma": karma, "start": start, "end": end});

    // Clear form
    target.laneMenu.value = '0';
    target.karmaMenu.value = 'Doux';
    target.start.value = '0';
    target.end.value = '1000';

  },
  // function to create a new random score
  'submit .new-score'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    //const text = target.text.value;

    const formConcertDuration = Number(target.concertDuration.value);
    const formEventDurationMin = Number(target.eventDurationMin.value);
    const formEventDurationMax = Number(target.eventDurationMax.value);
    const formNbPlayersMin = Number(target.nbPlayersMin.value);
    const formNbPlayersMax = Number(target.nbPlayersMax.value);

    const formEventDurationSpan = formEventDurationMax - formEventDurationMin;
    const formNbPlayersSpan = formNbPlayersMax - formNbPlayersMin;
    console.log("formNbPlayersSpan " + formNbPlayersSpan);

    var currentConcertDuration=0;
    var currentKarma = "par défaut";

    // iteratively create events and add them to the score
    // as long as not exceeding concert duration
    while( currentConcertDuration < formConcertDuration ){
      
      var players = [0, 1, 2, 3, 4, 5, 6];
      // decide how many players will play next sequence
      //var nPlayers = Math.floor(Math.random()*(players.length)); // should be decided by formular
      var nPlayers = Math.floor((Math.random() * formNbPlayersSpan) + formNbPlayersMin); // should be decided by formular

      // define event's duration
      var currentEventDuration = ( Math.random() * formEventDurationSpan ) + formEventDurationMin;

      //var activePlayersForThisSequence = Meteor.myFunctions.shuffle(players).slice(nPlayers);
      console.log("currentConcertDuration: " + currentConcertDuration + " - nPlayers: " + nPlayers + " - event duration: " + currentEventDuration);

      var activePlayersForThisSequence = [];
      var uniqueRandoms = [];
  
      for (var i = 0; i < nPlayers; i++){
          var index = Math.floor(Math.random() * players.length);
          activePlayersForThisSequence.push(players[index]);
          // now remove that value from the array
          players.splice(index, 1);
          //console.log(activePlayersForThisSequence);
      }
      console.log(activePlayersForThisSequence);
      for (var i = 0; i < activePlayersForThisSequence.length; i++){
        currentKarma = karmas[Math.floor(Math.random() * karmas.length)];
        console.log("currentKarma:" + currentKarma);
        Sequences.insert({"lane": activePlayersForThisSequence[i], "karma": currentKarma, "start": currentConcertDuration, "end": currentConcertDuration + currentEventDuration});        
      }

      currentConcertDuration += currentEventDuration;

    }

  }
});

var scoreMakerViewHidden = 1;
var eventMakerViewHidden = 1;

Template.body.events({
    'click .score-maker-view': function (e) {
      e.preventDefault();
      scoreMakerViewHidden = !scoreMakerViewHidden;
      //console.log("You pressed the button");
      if ( scoreMakerViewHidden ) $( ".score-maker" ).addClass("hidden");
      else $( ".score-maker" ).removeClass("hidden");
    },
    'click .event-maker-view': function (e) {
      e.preventDefault();
      eventMakerViewHidden = !eventMakerViewHidden;
      //console.log("You pressed the button");
      if ( eventMakerViewHidden ) $( ".event-maker" ).addClass("hidden");
      else $( ".event-maker" ).removeClass("hidden");
    },
    'click .clear-score': function(e) {
      e.preventDefault();
      Meteor.call('removeAllSequences')
    },
    'click .download-score': function(e) {
      e.preventDefault();
      var myScore = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(John.items));
      $('<a href="data:' + myScore + '" download="sequences.json">download JSON</a>').appendTo('#download_anchor');
    }
  });

