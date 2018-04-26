import { Mongo } from 'meteor/mongo';

// John's "sequences" : a start time, a duration, a player, ...

export const Sequences = new Mongo.Collection('sequences');
export const Lanes = new Mongo.Collection('lanes');
export const Karmas = new Mongo.Collection('karmas');
export const Nuances = new Mongo.Collection('nuances');


export const TheTime = new Mongo.Collection('time');

// to insert manually in mongo :
// start "meteor mongo" and type :
// db.sequences.insert({"lane": 0, "id": "Doux", "start": 5, "end": 205});