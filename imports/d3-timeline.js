/*
 * John
 *
 *
 */

export const John = { extensions: {} };

John.create = function (lanes, items, main_anchor, start_callback) {

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

	d3.select(main_anchor).html("");

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

	// define a graphical objects for later reuse
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
		.attr("height", 10);

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

	function display() {

		var rects, labels,
			minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];

		// get a list with items inside the visible scope
		var	visItems = items.filter(function(d) {return d.start < maxExtent && d.end > minExtent;});

		mini.select(".brush")
			.call(brush.extent([minExtent, maxExtent]));

		x1.domain([minExtent, maxExtent]);

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
			.style("stroke", "rgb(0,0,0)");
		rects.exit().remove();

		//update the item labels
		labels = itemRects.selectAll("text")
			.data(visItems, function (d) { return d._id; })
			.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 1);});
		labels.enter().append("text")
			.text(function(d) {return d.karma;})
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
	}

	// init display
	function init(){
		mini.select(".brush")
			.call(brush.extent([currentTime, currentTime+brushSize]));
		display();
	}

	init();


};
