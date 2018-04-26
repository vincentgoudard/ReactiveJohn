# ReactiveJohn (draft)

Draft for a reactive web version of [John sequencer](http://vincentgoudard.com/john/).


In a nutshell, to run Reactive John :
- start the server with the command "meteor run" in a shell
- open a browser at http://localhost:4000/

You can then create a random score (with the score maker)
You can move events (horizontal drag) and rescale them (vertical drag)
You can navigate in the score with the bottom view area in blue.

John is also sending OSC messages over UDP on port 7474.
You can find an example [Max](http://cycling74.com/) patch in the Max folder.

For OSC communication, John relies on [osc-min](https://github.com/russellmcc/node-osc-min) by @russellmcc.
