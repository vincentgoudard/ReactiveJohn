import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Sequences, Lanes, Karmas, Nuances, TheTime }  from '../imports/api/sequences.js';

import '../imports/d3/d3.v5.js';
import './lib/utils.js';

import { John } from '../imports/d3-timeline.js';

import './main.html';

import '../imports/zepto.js';
import '../imports/interface.js';

import screenfull from 'screenfull';


var TheJohn;

karmas = [];
nuances = [];
lanes = [];


////////////////////////////////////////////////////
// Test for reactive vars
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

////////////////////////////////////////////////////


const handle = Meteor.subscribe('john.public');

Tracker.autorun(() => {
	const isReady = handle.ready();
	console.log(`John < I am ${isReady ? 'ready' : 'not ready'}`);

	if(isReady) {
		// get the lanes
		var lanesCollection = Lanes.find({}).fetch();
		lanes = lanesCollection[0].lanes;
    console.log("John < lanes.length: " + lanes);


    // feed the lane Menus
    for (var i = 0; i < lanes.length; i++) {
      var myElement = "<option value=" + i + ">" + lanes[i] + "</option>";
      $( ".laneMenu" ).append( myElement );
    }

    // get the karmas and nuances
    var karmasCollection = Karmas.find({}).fetch();
    karmas = karmasCollection[0].karmas;
    var nuancesCollection = Nuances.find({}).fetch();
    nuances = nuancesCollection[0].nuances;
    console.log('John < nuances : ' + nuances);   
    console.log('John < karmas : ' + karmasCollection[0].karmas);

    // feed the karma Menu(s)
    for (var i = 0; i < karmas.length; i++) {
      var myElement = "<option value=" + karmas[i] + ">" + karmas[i] + "</option>";
      $( ".karmaMenu" ).append( myElement );
    }

        // feed the nuance Menu(s)
    for (var i = 0; i < nuances.length; i++) {
      var myElement = "<option value=" + nuances[i] + ">" + nuances[i] + "</option>";
      $( ".nuanceMenu" ).append( myElement );
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
  'submit .modify-event'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    //console.log(John.items);
    // Get value from form element
    const target = event.target;
    const newKarma = target.karmaMenu.value;
    const newNuance = target.nuanceMenu.value;

    console.log('ttt ' + newKarma +' ' + newKarma);

    function editEventForSelectedItem(element) {
      if (element.selected){
        // element.karma = newKarma;
        Sequences.update({"_id":element._id}, {"lane":element.lane, "karma": newKarma, "nuance": newNuance,"start":element.start, "end":element.end });
      }
    }

    John.items.forEach(editEventForSelectedItem);


//    Sequences.insert({"lane": lane, "karma": karma, "start": start, "end": end});

    // Clear form
    target.karmaMenu.value = 'Doux';
    target.nuanceMenu.value = 'mf';

  },
  'submit .new-event'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    //const text = target.text.value;
    const lane = Number(target.laneMenu.value);
    const karma = target.karmaMenu.value;
    const nuance = target.nuanceMenu.value;
    const start = Number(target.start.value);
    const end = Number(target.end.value);

    //// Insert an event into the collection
    //Tasks.insert({
    //  text,
    //  createdAt: new Date(), // current time
    //});

    Sequences.insert({"lane": lane, "karma": karma, "nuance" : nuance, "start": start, "end": end});

    // Clear form
    target.laneMenu.value = '0';
    target.karmaMenu.value = 'Doux';
    target.nuanceMenu.value = 'mf';
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
    const formNbPlayersMin = Math.max(0, Math.min(lanes.length, Number(target.nbPlayersMin.value)));
    const formNbPlayersMax = Math.max(0, Math.min(lanes.length, Number(target.nbPlayersMax.value)));

    const formEventDurationSpan = formEventDurationMax - formEventDurationMin;
    const formNbPlayersSpan = formNbPlayersMax - formNbPlayersMin;
    console.log('John < formNbPlayersSpan: ' + formNbPlayersSpan);

    var currentConcertDuration=0;
    var currentKarma = "par défaut";
    var currentNuance = "mf";


    console.log('John < creating score...');

    // allPlayers contains indices of all active players
    allPlayers = [];
    for (var i = 0; i < lanes.length; i++) {
       allPlayers.push(i);
    }

    // iteratively create events and add them to the score
    // as long as not exceeding concert duration
    while(currentConcertDuration < formConcertDuration ){

      // var players = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      // decide how many players will play next sequence
      //var nPlayers = Math.floor(Math.random()*(players.length)); // should be decided by formular
      var nPlayers = Math.floor(((Math.random()) * formNbPlayersSpan) + formNbPlayersMin); // should be decided by formular

      // define event's duration
      var currentEventDuration = jUtils.roundN(( Math.random() * formEventDurationSpan ) + formEventDurationMin, 10);

      //var activePlayersForThisSequence = Meteor.myFunctions.shuffle(players).slice(nPlayers);
      console.log('John < currentConcertDuration: ' + currentConcertDuration + ' - nPlayers: ' + nPlayers + ' - event duration: ' + currentEventDuration);

      var activePlayersForThisSequence = [];
      var uniqueRandoms = [];
  
      //activePlayersForThisSequence = jUtils.getRandomItems(players, nPlayers );

      // allPlayers contains indices of all active players
      var playersSpliced =  allPlayers.slice(0);

      for (var i = 0; i < nPlayers; i++){
          var index = Math.floor(Math.random() * playersSpliced.length);
          activePlayersForThisSequence.push(playersSpliced[index]);
          // now remove that value from the array
          playersSpliced.splice(index, 1);
          //console.log(activePlayersForThisSequence);
      }

      // trying to externalize the code above to jUtils, without success so far
      //activePlayersForThisSequence = jUtils.uniqueRandomNumbers(allPlayers, nPlayers );


      console.log(activePlayersForThisSequence);
      for (var i = 0; i < activePlayersForThisSequence.length; i++){
        currentKarma = karmas[Math.floor(Math.random() * karmas.length)];
        currentNuance = nuances[Math.floor(Math.random() * nuances.length)];

        console.log("John < currentKarma: " + currentKarma + " currentNuance: " + currentNuance);
        Sequences.insert({"lane": activePlayersForThisSequence[i], "karma": currentKarma, "nuance": currentNuance, "start": currentConcertDuration, "end": currentConcertDuration + currentEventDuration});        
      }

      currentConcertDuration += currentEventDuration;

    }

  }
});

var scoreMakerViewHidden = 1;
var eventMakerViewHidden = 1;
var eventModifierViewHidden = 1;

Template.body.events({
    'click button.score-maker-view': function (e) {
      e.preventDefault();
      scoreMakerViewHidden = !scoreMakerViewHidden;
      //console.log("You pressed the button");
      if ( scoreMakerViewHidden ) {
        $( ".score-maker" ).addClass("hidden");
        $(".score-maker-view").html('&#x25b6; SCORE MAKER');
      }
      else {
        $( ".score-maker" ).removeClass("hidden");
        $(".score-maker-view").html('&#x25bc; SCORE MAKER');
      }
    },
    'click button.event-maker-view': function (e) {
      e.preventDefault();
      eventMakerViewHidden = !eventMakerViewHidden;
      //console.log("You pressed the button");
      if ( eventMakerViewHidden ) {
        $( ".event-maker" ).addClass("hidden");
        $(".event-maker-view").html('&#x25b6; EVENT MAKER');
      }
      else {
        $( ".event-maker" ).removeClass("hidden");
        $(".event-maker-view").html('&#x25bc; EVENT MAKER');
      }
    },
    'click button.event-modifier-view': function (e) {
      e.preventDefault();
      eventModifierViewHidden = !eventModifierViewHidden;
      //console.log("You pressed the button");
      if ( eventModifierViewHidden ) {
        $( ".event-modifier" ).addClass("hidden");
        $(".event-modifier-view").html('&#x25b6; EVENT MODIFIER');
      }
      else {
        $( ".event-modifier" ).removeClass("hidden");
        $(".event-modifier-view").html('&#x25bc; EVENT MODIFIER');
      }
    },
    'click button.event-delete': function(e) {
      // Prevent default browser form submit
      e.preventDefault();
      console.log('John < deleted event ' + element._id);
      // Get value from form element        
      function deleteSelectedItem(element) {
        if (element.selected){
          console.log("element._id:", element._id);
          // element.karma = newKarma;
          //Sequences.remove({"_id"=element._id});
          var theQuery = {"_id": element._id};
          Meteor.call('removeSequences', theQuery);
        }
      } 
      John.items.forEach(deleteSelectedItem);
    },
    'click button.clear-score': function(e) {
      e.preventDefault();
      Meteor.call('removeAllSequences');
    },
    'click button.download-score': function(e) {
      e.preventDefault();
      // erase previous outdated links
      $('#download_anchor').html("");
      var myScore = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({score:John.items}));
      $('<a href="data:' + myScore + '" download="sequences.json">download JSON</a>').appendTo('#download_anchor');
    },
    'click button.fullscreen': function(e) {
      const john_score_el = $('#john_anchor_1')[0]; // Get DOM element from jQuery collection
      console.log("click");
      if (screenfull.enabled) {
        screenfull.request(john_score_el);
      }
    }
    //,
    //'click .button.play': function(e) {
    //  $(".button.play").find('i').toggleClass('fa-play fa-pause');
    //}
  });
///////////////////////////////////////////////////////


var gConnection; // websocket gConnection
var gConnectionID = -1;
var panel;
var connectButton;
var label;
var xypad;

function init() {  
//   panel = new Interface.Panel({  
//    background:"#fff", 
//    stroke:"#000",
//    container:$("#panel"),
//    useRelativeSizesAndPositions : true
//  }); 
  
  connectButton = new Interface.Button({ 
    background:"#fff",
    bounds:[0.,0.,0.2,0.05 ],  
    label:'WebSocket Connect',    
    size:14,
    stroke:"#000",
    style:'normal',
    onvaluechange: function() {
      this.clear();
      toggleConnection();
    }
  });
  
  label = new Interface.Label({ 
    bounds:[0.21,0.,0.9, 0.05],
    value:'',
    hAlign:'left',
    vAlign:'middle',
    size:12,
    stroke:"#000",
    style:'normal'
  });
  
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
            
            if(json.substr(0, 7) == "set_id ")
            {
              gConnectionID = parseInt(json.substr(7));
              writeToScreen('Connection ID ' + gConnectionID);
            }
            else if(json.substr(0, 5) == "move ")
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

function getRandomItems(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

init();
