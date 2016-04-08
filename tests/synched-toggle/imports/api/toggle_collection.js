import { Mongo } from 'meteor/mongo';

 //create a collection
 export const ToggleCollection = new Mongo.Collection('toggleCollection');
 // clear it in the case it already exists
 //ToggleCollection.remove({});
 // add a toggle state and initialize it to 1
 ToggleCollection.insert({ myFirstToggle: "0"});