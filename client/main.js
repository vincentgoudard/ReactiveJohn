import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Sequences } from '../imports/api/sequences.js';

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
		var seq = Sequences.find({}).fetch();
		var lanes = seq[0].lanes;
		var items = seq[0].items;
		var john1 = John.create(lanes, items, "#john_anchor_1");
	}
});
