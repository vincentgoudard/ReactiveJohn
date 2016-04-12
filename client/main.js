import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Sequences, Lanes, TheTime } from '../imports/api/sequences.js';

import '../imports/d3/d3.v2.js';
import { John } from '../imports/d3-timeline.js';

import './main.html';

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

		var eventsCollection = Sequences.find({}).fetch();

		var john1 = John.create(lanes, eventsCollection, "#john_anchor_1");
	}
});

Template.body.events({
  'submit .new-event'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    //const text = target.text.value;
    const lane = Number(target.lane.value);
    const karma = target.karma.value;
    const start = Number(target.start.value);
    const end = Number(target.end.value);

    //// Insert an event into the collection
    //Tasks.insert({
    //  text,
    //  createdAt: new Date(), // current time
    //});

    Sequences.insert({"lane": lane, "id": karma, "start": start, "end": end});

    // Clear form
    target.lane.value = '0';
    target.karma.value = 'doux';
    target.start.value = '0';
    target.end.value = '1000';

    Template.hello.events();
  }
});
