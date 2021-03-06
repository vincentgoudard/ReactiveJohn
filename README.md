ReactiveJohn (draft)
======

Draft for a reactive web version of [John sequencer](http://vincentgoudard.com/john/).

As a Meteor app, John consists of :
- a server requiring some installation (see below);
- a client that will run on any web browser without needing to install anything.


Installing John server
------
1. [Install Meteor](https://www.meteor.com/install);
2. Clone this repository or download it as zip;
3. Unzip it, open a bash and go to root folder;
3. Install [screenfull](https://www.npmjs.com/package/screenfull) package by running `meteor npm install --save @babel/runtime screenfull`
4. Install [osc-min](https://www.npmjs.com/package/osc-min) package by running
```Bash
meteor npm install --save osc-min
```
5. You'll probably need to do that too : `meteor npm install @babel/runtime@7.0.0-beta.55`
6. Try to launch John server by writing :
```Bash
meteor run
```
7. If meteor succeeds to compile (despite a few warning, ahem), you should see something like:
```Bash
=> Started your app.
=> App running at: http://localhost:4000/
```
8. Scream "hell yes!" and open a browser at url http://localhost:4000/ (you should maybe allow your firewall to accept that)


Using John clients
------
You can then create a random score (with the score maker).
You can move events (horizontal drag) and rescale them (vertical drag).
You can navigate in the score with the bottom view area in blue.

John is also sending OSC messages over UDP on port 7474.
You can find an example [Max](http://cycling74.com/) patch in the Max folder.

For OSC communication, John relies on [osc-min](https://github.com/russellmcc/node-osc-min) by @russellmcc.

Licence
------
If you happen to use John, please let me know what about your project!
And if you have troubles using it, please fill an issue!