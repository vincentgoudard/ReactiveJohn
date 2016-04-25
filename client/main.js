import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Sequences, Lanes, Karmas, TheTime }  from '../imports/api/sequences.js';

import '../imports/d3/d3.v2.js';
import { John } from '../imports/d3-timeline.js';

import './main.html';

import '../imports/zepto.js';
import '../imports/interface.js';

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
      var currentEventDuration = roundN(( Math.random() * formEventDurationSpan ) + formEventDurationMin, 10);

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
      // erase previous outdated links
      $('#download_anchor').html("");
      var myScore = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(John.items));
      $('<a href="data:' + myScore + '" download="sequences.json">download JSON</a>').appendTo('#download_anchor');
    }
  });
///////////////////////////////////////////////////////

var gConnection; // websocket gConnection

var panel;
var connectButton;
var label;
var xypad;

function init() {  
   panel = new Interface.Panel({  
    background:"#fff", 
    stroke:"000",
    container:$("#panel"),
    useRelativeSizesAndPositions : true
  }); 
  
  connectButton = new Interface.Button({ 
    background:"#fff",
    bounds:[0.,0.,0.2,0.05 ],  
    label:'WebSocket Connect',    
    size:14,
    stroke:"000",
    style:'normal',
    onvaluechange: function() {
      this.clear();
      toggleConnection();
    }
  });
  
  label = new Interface.Label({ 
    bounds:[0.4,0.,1.9, 0.05],
    value:'',
    hAlign:'left',
    vAlign:'middle',
    size:12,
    stroke:"000",
    style:'normal'
  });
  
  xypad = new Interface.XY({
    background:"#fff",
    stroke:"000",
    childWidth: 40,
    numChildren: 1,
    bounds:[0,0.06,0.9,0.9],
    usePhysics : false,
    friction : 0.9,
    activeTouch : true,
    maxVelocity : 100,
    detectCollisions : true,
    onvaluechange : function() {
      if(gConnection) 
        gConnection.send(JSON.stringify(this.values[0], function(key, val) {
            return val.toFixed ? Number(val.toFixed(3)) : val;
            })
        );
    },
    oninit: function() { this.rainbow() }
  });
  
  panel.add(connectButton, label, xypad);
}

function writeToScreen (message) {
  label.clear();
  label.setValue(message);
}

function ws_connect() {
    if ('WebSocket' in window) {

        writeToScreen('Connecting');
        gConnection = new WebSocket('ws://' + window.location.host + '/maxmsp');
        gConnection.onopen = function(ev) {
        
            connectButton.label = "WebSocket Disconnect";
//            document.getElementById("update").disabled=false;
//            document.getElementById("update").innerHTML = "Disable Update";
            writeToScreen('CONNECTED');
            var message = 'update on';
            writeToScreen('SENT: ' + message);
            gConnection.send(message);
        };

        gConnection.onclose = function(ev) {
//            document.getElementById("update").disabled=true;
//            document.getElementById("update").innerHTML = "Enable Update";
            connectButton.label = "WebSocket Connect";
            writeToScreen('DISCONNECTED');
        };

        gConnection.onmessage = function(ev) {
          //TODO: handle messages
          if(ev.data.substr(0, 3) == "rx ")
          {
            json = ev.data.substr(3);
            
            if(json.substr(0, 5) == "move ")
            {
              values = JSON.parse(json.substr(5));
              xypad.children[0].x = values.x * xypad._width();
              xypad.children[0].y = values.y * xypad._height();
              //console.log(xypad.children[0]);
              xypad.refresh();
            }
          }
          
          writeToScreen('RECEIVED: ' + ev.data);
        };

        gConnection.onerror = function(ev) {
            alert("WebSocket error");
        };

    } else {
        alert("WebSocket is not available!!!\n" +
              "Demo will not function.");
    }
}

// user connect/disconnect
function toggleConnection() {
    if (connectButton.label == "WebSocket Connect") {
      ws_connect();
    }
    else {
      gConnection.close();
    }
}
//
//// user turn updates on/off
//function toggleUpdate(el) {
//    var tag=el.innerHTML;
//    var message;
//    if (tag == "Enable Update") {
//        message = 'update on';
//        el.innerHTML = "Disable Update";
//    }
//    else {
//        message = 'update off';
//        el.innerHTML = "Enable Update";
//    }
//    writeToScreen('SENT: ' + message);
//    gConnection.send(message);
//}

init();


function roundN(input, grid)
{
    return Math.ceil(input/grid)*grid;
}
