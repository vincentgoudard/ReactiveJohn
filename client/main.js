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

//variables for local time transport
var local_isPlaying = 0;
local_currentTime = 0;
currentTime = 0;
var local_timeIncrement = 0;
var local_playingSpeed = 1;
var local_newTime = 0;
var local_prevTime = 0;
transportLock = true;

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
    $('.laneMenu').empty();
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
    $('.karmaMenu').empty();
    for (var i = 0; i < karmas.length; i++) {
      var myElement = "<option value=" + karmas[i] + ">" + karmas[i] + "</option>";
      $( ".karmaMenu" ).append( myElement );
    }

    // feed the nuance Menu(s)
    $('.nuanceMenu').empty();
    for (var i = 0; i < nuances.length; i++) {
      var myElement = "<option value=" + nuances[i] + ">" + nuances[i] + "</option>";
      $( ".nuanceMenu" ).append( myElement );
    }

    // get the events
		var eventsCollection = Sequences.find({}).fetch();

    // create a view for timeline
		John.create(Sequences, lanes, eventsCollection, "#john_anchor_1", function(time){
			//var currentTime = TheTime.find('timer').fetch();
			// inverse playing
			//local_isPlaying = !currentTime[0].playing;

			//TheTime.upsert('timer', {$set:{"john_start": time}}); // no need, time is computed on server
			//TheTime.upsert('timer', {$set:{"playing": playing}});
		});
	}
});

// the tracker below is automatically called when the data on the server is updated
// this means at least every 100ms, since it is the delay we compute currentTime on the server

Tracker.autorun(() => {
//  if(transportLock){
  //console.log('hey');
    var theTimeCollection = TheTime.find('timer').fetch();
    if(theTimeCollection.length == 1) {
       //John.setTime(currentTime[0].time, currentTime[0].john_start, currentTime[0].playing);
       //John.setTime(theTimeCollection[0].currentTime, theTimeCollection[0].playing);
    }
});


// funtion update time is called by both client-side interval 
function updateLocalTime() {
  local_newTime = Date.now();
  local_timeIncrement = local_newTime  - local_prevTime;
  local_prevTime = local_newTime;
  local_currentTime += local_playingSpeed * local_timeIncrement / 1000;
  currentTime = local_currentTime;
  John.setTime(currentTime);
  //console.log('John < updating local transport',local_currentTime, local_newTime, local_prevTime, local_timeIncrement)

}

function updateTransportFromServer() {
  console.log('John < updating server transport')
  var theTimeCollection = TheTime.find('timer').fetch();
  if(theTimeCollection.length == 1) {
    currentTime = theTimeCollection[0].currentTime;
    //John.setTime(currentTime[0].time, currentTime[0].john_start, currentTime[0].playing);
    John.setTime(currentTime);
  }
}

var localTransport;
var serverTransport;


Template.body.events({
  'submit .modify-event'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    //console.log(John.items);
    // Get value from form element
    const target = event.target;
    const newKarma = target.karmaMenu.value;
    const newNuance = target.nuanceMenu.value;

    function editEventForSelectedItem(element) {
      if (element.selected){
        // element.karma = newKarma;
        Sequences.update({"_id":element._id}, {"lane":element.lane, "karma": newKarma, "nuance": newNuance,"start":element.start, "end":element.end });
      }
    }
    John.items.forEach(editEventForSelectedItem);
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
  } //end submit .new-score
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

      // Get value from form element        
      function deleteSelectedItem(element) {
        if (element.selected){
          console.log('John < deleted event ' + element._id);
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
      // format date to name file
      var d = new Date();
      var formattedDate = (
      d.getFullYear() +
      ("00" + (d.getMonth() + 1)).slice(-2) + 
      ("00" + d.getDate()).slice(-2) + "." +
      ("00" + d.getHours()).slice(-2) +
      ("00" + d.getMinutes()).slice(-2) +
      ("00" + d.getSeconds()).slice(-2));

      var myScore = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({score:John.items}));
      var dlAnchorElem = document.getElementById('download_anchor');
      dlAnchorElem.setAttribute("href", myScore);
      dlAnchorElem.setAttribute("download", formattedDate+".JohnScore.json");
      dlAnchorElem.click();
    },
    'click button.fullscreen': function(e) {
      e.preventDefault();
      const john_score_el = $('#john_anchor_1')[0]; // Get DOM element from jQuery collection
      if (screenfull.enabled) {
        screenfull.request(john_score_el);
      }
    },
    'click button.lock': function(e) {
      e.preventDefault();
      transportLock = !transportLock;
      console.log('John < transport lock set to', transportLock);

      //var theTimeCollection = TheTime.find('timer').fetch();
      // inverse playing
      //local_isPlaying = !currentTime[0].playing;


      // update icons
      if(transportLock) {
        clearInterval(localTransport);
        $(".btn.lock").find('i').addClass('fa-lock');
        $(".btn.lock").find('i').removeClass('fa-lock-open');
        $(".btn.lock").addClass('btn-info');
        $(".btn.lock").removeClass('btn-warning');    
        console.log('John < cleared local transport');
      }
      else {
        clearInterval(serverTransport);
        $(".btn.lock").find('i').addClass('fa-lock-open');
        $(".btn.lock").find('i').removeClass('fa-lock');
        $(".btn.lock").addClass('btn-warning');
        $(".btn.lock").removeClass('btn-info');    
      }
    },
    'click button.play': function(e) {
      e.preventDefault();
      console.log('John < activateTransport before',local_isPlaying );
      local_isPlaying = !local_isPlaying;
      console.log('John < activateTransport after ',local_isPlaying );

      if (transportLock){
        Meteor.call('activateTransport', local_isPlaying);
        if (local_isPlaying){
          //TheTime.upsert('timer', {$set:{"playing": local_isPlaying}}); // this should be done by the server
          serverTransport = setInterval(function () { updateTransportFromServer();}, 40);        
        }
        else{
          clearInterval(serverTransport);
        }
      }
      else {
        if (local_isPlaying){
          local_prevTime = Date.now();
          localTransport = setInterval(function () { updateLocalTime();}, 40); 
        }
        else { 
          clearInterval(localTransport);
          console.log('John < cleared local transport');
        }
      }
      // update icons
      if (local_isPlaying) {
        $(".btn.play").find('i').addClass('fa-pause');
        $(".btn.play").find('i').removeClass('fa-play');
      }
      else {
        $(".btn.play").find('i').addClass('fa-play');
        $(".btn.play").find('i').removeClass('fa-pause');
      }
    },
    'click button.rewind': function(e) {
      e.preventDefault();
      local_currentTime = 0;
      // if (transportLock){TheTime.upsert('timer', {$set:{"currentTime": local_currentTime}});}
      if (transportLock){
        Meteor.call('setServerTime', 0);
        updateTransportFromServer();
      }
      else {
        John.setTime(local_currentTime);
      }
    },
    'click button.about': function(e) {
      e.preventDefault();
      $('.modal').css( "display", "block" );
    },
    'click button.aboutclose': function(e) {
      e.preventDefault();
      $('.modal').css( "display", "none" );
    },
    'change input.playing_speed': function(e) {
      e.preventDefault();
      local_playingSpeed = $('input.playing_speed').val();
      console.log('John < setting playingSpeed to: ', local_playingSpeed);
      // if (transportLock){TheTime.upsert('timer', {$set:{"currentTime": local_currentTime}});}
      if (transportLock){Meteor.call('setServerPlayingSpeed', local_playingSpeed);}
      //John.setTime(local_currentTime);
    }
});

///////////////////////////////////////////////////////

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