/*
 * John
 *
 *
 */

export const John = { extensions: {} };
import '../client/lib/utils.js';

John.create = function (Sequences, lanes, items, main_anchor, start_callback) {
	console.log("john created");
	// clear whatever already exists in main anchor
	d3.select(main_anchor).html("");

	this.items = items;

	var selectedEvents = [];
	var TheSharedTime;
	this.setTime = function(time, start_time, playing) {
		TheSharedTime = time;

		if(playing)
		{
			start_button.text("stop").style("background-color", "LightGreen");
			timeOffset = start_time;
			animate();
		}
		else {
		   start_button.text("start").style("background-color", "LightCoral");
		}
	}

	// define drag callbacks
	var drag = d3.behavior.drag()
    //.origin(function(d) { return {x:x1(d.start),y:y1(d.lane)}; })
	.origin(function(d) { return {x:x1(d.start),y:(x1(d.end) - x1(d.start))}; })
    .on("dragstart", dragstart)
    .on("drag", dragmove)
    .on("dragend", dragend);

	var laneLength = lanes.length;

	// find biggest value for time end
	var timeBegin = 0,
		timeEnd = 3600;

//		timeEnd = -Infinity;
	var i;
	for(i=0; i < items.length; i++) {
		if( items[i].end > timeEnd) timeEnd = items[i].end;
	}
	console.log("max time: ", timeEnd);


	// définit les dimensions du graph
	var m = [20, 15, 15, 120], //top right bottom left
		w = 1200 - m[1] - m[3],
		h = 500 - m[0] - m[2],
		miniHeight = laneLength * laneLength + 50,
		mainHeight = h - miniHeight - 50;

	//scales
	var x = d3.scale.linear()
			.domain([timeBegin, timeEnd])
			.range([0, w]);
	var x1 = d3.scale.linear()
			.range([0, w]);
	var y1 = d3.scale.linear()
			.domain([0, laneLength])
			.range([0, mainHeight]);
	var y2 = d3.scale.linear()
			.domain([0, laneLength])
			.range([0, miniHeight]);
	

	// create the chart as an svg element
	var chart = d3.select(main_anchor)
				.append("svg")
				.attr("width", w + m[1] + m[3])
				.attr("height", h + m[0] + m[2])
				.attr("class", "chart");

	// and a start/stop button underneath
	var start_button = d3.select(main_anchor)
						.append("button")
						.text("start")
						.on("click", function() {start_callback(TheSharedTime);});

	// and a display of the current transport time
	var sequenceTimeDisplay = d3.select(main_anchor)
						.append("div")
						.text("current time : 0s");

	// define a clip-path matching main height to prevent rects to spread ontop of lanes names
	chart.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", w)
		.attr("height", mainHeight);

	// definit les attributs d'affichage pour main et mini
	var main = chart.append("g")
				.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
				.attr("width", w)
				.attr("height", mainHeight)
				.attr("class", "main");
	var mini = chart.append("g")
				.attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0]) + ")")
				.attr("width", w)
				.attr("height", miniHeight)
				.attr("class", "mini");

	//main lanes and texts
	main.append("g").selectAll(".laneLines")
		.data(items)
		.enter().append("line")
		.attr("x1", m[1])
		.attr("y1", function(d) {return y1(d.lane);})
		.attr("x2", w)
		.attr("y2", function(d) {return y1(d.lane);})
		.attr("stroke", "lightgray")
	main.append("g").selectAll(".laneText")
		.data(lanes)
		.enter().append("text")
		.text(function(d) {return d;})
		.attr("x", -m[1])
		.attr("y", function(d, i) {return y1(i + .5);})
		.attr("dy", ".5ex")
		.attr("text-anchor", "end")
		.attr("class", "laneText")
		.style("fill", function(d, i) {return "hsl(" + i / laneLength * 360. + ",50%,40%)";});// a color for each lane
 

	//mini lanes and texts
	mini.append("g").selectAll(".laneLines")
		.data(items)
		.enter().append("line")
		.attr("x1", m[1])
		.attr("y1", function(d) {return y2(d.lane);})
		.attr("x2", w)
		.attr("y2", function(d) {return y2(d.lane);})
		.attr("stroke", "lightgray");
	mini.append("g").selectAll(".laneText")
		.data(lanes)
		.enter().append("text")
		.text(function(d) {return d;})
		.attr("x", -m[1])
		.attr("y", function(d, i) {return y2(i + .5);})
		.attr("dy", ".5ex")
		.attr("text-anchor", "end")
		.attr("class", "laneText")
		.style("fill", function(d, i) {return "hsl(" + i / laneLength * 360. + ",50%,40%)";}); // a color for each lane



	var itemRects = main.append("g")
						.attr("clip-path", "url(#clip)");

	//mini item rects
	mini.append("g").selectAll("miniItems")
		.data(items)
		.enter().append("rect")
		.attr("class", function(d) {return "miniItem" + d.lane;})
		.attr("x", function(d) {return x(d.start);})
		.attr("y", function(d) {return y2(d.lane + .5) - 5;})
		.attr("width", function(d) {return x(d.end - d.start);})
		.attr("height", 10)
		.style("fill", function(d, i) {return "hsl(" + d.lane / laneLength * 360. + ",50%,40%)";}) // a color for each lane
		.style("fill-opacity", "0.7");

	//mini labels
	mini.append("g").selectAll(".miniLabels")
		.data(items)
		.enter().append("text")
		.text(function(d) {return d.karma;})
		.attr("x", function(d) {return x(d.start) + 1;})
		.attr("y", function(d) {return y2(d.lane + .5);})
		.attr("dy", ".5ex");


	//brush - define the "brush" (selected area) and make the display() function the listener when brush moves
	var brush = d3.svg.brush()
						.x(x)
						.on("brush", display); /*choix entre brushstart, brush, brushend*/


	mini.append("g")
		.attr("class", "x brush")
		.call(brush)
		.selectAll("rect")
		.attr("y", 1)
		.attr("height", miniHeight - 1);

	// Time axes
	var xAxis = d3.svg.axis().scale(x).ticks(20).orient("bottom"),
	    xAxis2 = d3.svg.axis().scale(x1).orient("bottom");



	mini.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + miniHeight + ")")
      .call(xAxis);

	var rects, labels, rbrushes;

	function display() {

		var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];

		// get a list with items inside the visible scope
		var	visItems = items.filter(function(d) {return d.start < maxExtent && d.end > minExtent;});

		mini.select(".brush")
			.call(brush.extent([minExtent, maxExtent]));

		x1.domain([minExtent, maxExtent]);

		// update x-axis for main view (disabled while overlaying mini-lane)
		//main.selectAll('.x.axis').remove();
		//main.append("g")
      	//	.attr("class", "x axis")
      	//	.attr("transform", "translate(0," + mainHeight + ")")
      	//	.call(xAxis2);

		//update main item rects
		rects = itemRects.selectAll("rect")
				.data(visItems, function(d) { return d._id; })
			.attr("x", function(d) {return x1(d.start);})
			.attr("width", function(d) {return x1(d.end) - x1(d.start);});

		rects.enter().append("rect")
			.attr("class", function(d) {return "miniItem" + d.lane;})
			.attr("x", function(d) {return x1(d.start);})
			.attr("y", function(d) {return y1(d.lane) + 5;})
			.attr("width", function(d) {return x1(d.end) - x1(d.start);})
			.attr("height", function(d) {return .8 * y1(1);})
			.style("stroke-width", "1")
			.style("stroke", "rgb(0,0,0)")
			.style("fill", function(d, i) {return "hsl(" + d.lane / laneLength * 360. + ",50%,40%)";}) // a color for each lane
			.style("fill-opacity", "0.7")
			.call(drag);
		rects.exit().remove();

		// updates rbrushes
		//rbrushes = 

		//update the item labels
		labels = itemRects.selectAll("text")
			.data(visItems, function (d) { return d._id; })
			.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 1);});
		labels.enter().append("text")
			.text(function(d) {return (d.karma + ' - ' + d.start + ' - ' + d.end );})
			.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 1);})
			.attr("y", function(d) {return y1(d.lane + .5);})
			.attr("text-anchor", "start");
		labels.exit().remove();
	}

	var currentTime = 0;
	var brushSize = 500;
	var timeOffset;
	var requestId = undefined;

	function animate() {

		currentTime = ( TheSharedTime - timeOffset ) / 1000;
		//console.log(TheSharedTime);

		sequenceTimeDisplay.text("current time : " + currentTime.toFixed(2) + "s");

		// make condition that stop cursor if time exceeds graph domain
		if (currentTime > timeEnd ) {
			console.log(w);
			return;
		}


		mini.select(".brush")
			.call(brush.extent([currentTime, currentTime+brush.extent()[1]-brush.extent()[0]]));

		display();

		var text = chart.selectAll("text")
								.enter()
								.append("text");
	}

	// init display
	function init(){
		mini.select(".brush")
			.call(brush.extent([currentTime, currentTime+brushSize]));
		display();
	}

	init();

	// add a "selected" field for events
	items.forEach(function(obj){obj.selected = false});

	function dragstart(d) {
		//d3.select(this).style("fill", "pink");
		d3.select(this).style("stroke", "red");
		 //console.log(d3.select(this));
		//	selectedEvents.push(d._id);
	}
	
	function dragmove(d) {
	  //console.log(d3.event, d3.event);
		
		//console.log('d3.event: ', d3.event);
		console.log('data: ', d);

	  	var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];
		//console.log('min/max brush', minExtent, maxExtent);

		var thisDatum = d;
		x1.domain([0, maxExtent-minExtent]);

	  // TODO : update du data
		if (d3.select(this)[0][0].localName == "rect"){
			d3.select(this)
			    .attr("x", Math.max(0, Math.min(w - 10, jUtils.roundN(d3.event.x, x1(10)))), 10.)
			    .attr("width", Math.max(jUtils.roundN(d3.event.y,x1(10)), 10));
			//labels
			    //.attr("y", d.y = Math.max(0, Math.min(height - 1000, d3.event.y)));
	  	}
	  	console.log('labels: ', labels);

	  	// get a list with items inside the visible scope
		var	theLabel = labels.filter(function(d) {return d.text == thisDatum.karma;});
		console.log(theLabel);

	  	//update the item labels
		//labels = itemRects.selectAll("text")
		//	.data(visItems, function (d) { return d._id; })
		//	.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 1);});
		//labels.enter().append("text")
		//	.text(function(d) {return (d.karma + ' - ' + d.start + ' - ' + d.end );})
		//	.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 1);})
		//	.attr("y", function(d) {return y1(d.lane + .5);})
		//	.attr("text-anchor", "start");
		//labels.exit().remove();
	}
	
	function dragend(d) {
		//console.log(d3.select(this));
		//console.log(xb(d3.select(this)[0][0].x.baseVal.value));
		//console.log(d);

		d3.select(this).style("stroke", "black");

		// toggle selection
		d.selected = !d.selected;

		if (d.selected)	d3.select(this).style("fill", "red")
			else d3.select(this).style("fill", null);
	
	  	var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];
		
		//x1.domain([0, maxExtent-minExtent]);

		// scale function from graph position to data value
		var invX = d3.scale.linear()
				.domain([0, w])
				.range([minExtent, maxExtent]);

		//console.log("min-max brush: ", minExtent, maxExtent);

		// color back to normal
		//d3.select(this).style("fill", null);
	
		// update data info
		//var duration = (d.end - d.start);
		//console.log('this :', this);

		//console.log('new width :', this.getAttribute('width'));
		var newStart = jUtils.roundN(invX(this.getAttribute('x')*1), 10);

		invX.range([0, maxExtent - minExtent]);
		var duration = jUtils.roundN(invX(this.getAttribute('width')*1), 10); // *1 converts string to number

		//console.log('new duration :', duration);

		// convert graph position to data value
		d.start = newStart; // 
		d.end = d.start + duration;
	
		// update display to move label along
		// display();

		////update mongo collection
		//console.log("d.id : ", d._id);
		Sequences.update({"_id":d._id}, {"lane":d.lane, "karma": d.karma, "start":d.start, "end":d.end });

		//console.log(Sequences.find({}).fetch());

	}

};
