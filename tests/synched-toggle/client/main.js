import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ToggleCollection } from '../imports/api/toggle_collection.js';

import './main.html';

//Template.toggle.helpers({
//	myFirstToggle: "0"
//});


//Template.toggle.helpers({
//	return ToggleCollection.find({});
//});

//console.log(Template.toggle);

Template.toggle.myFirstToggle = function() {
	console.log(ToggleCollection.find({}));
	return ToggleCollection.find({})[0].myFirstToggle;
};