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
			console.log(start_time);
			timeOffset = start_time;
			$(".button.play").find('i').addClass('fa-pause');
			$(".button.play").find('i').removeClass('fa-play');
			animate();
		}
		else {
			$(".button.play").find('i').addClass('fa-play');
			$(".button.play").find('i').removeClass('fa-pause');
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

	// visibleLanes defines the indices of visible lanes
	var visibleLanes = [0, 1, 2, 3, 4, 5, 6];
	// filter out elements from score which do not belong to visible lanes
		visibleLanesItems = lanes.filter(function(d, i) { return (($.inArray(i, visibleLanes))!=-1)});


	// find biggest value for time end
	var timeBegin = 0, timeEnd = 0;
	for(var i=0; i < items.length; i++) {
		if( items[i].end > timeEnd) timeEnd = items[i].end;
	}

	console.log("max time: ", timeEnd);
	
	console.log("dyn-width", $('#john_anchor_1').width());


	// définit les dimensions du graph
	var m = [20, 15, 15, 120], //top right bottom left
		//w = 1200 - m[1] - m[3],
		//totalWidth = 1200 - m[1] - m[3],
		totalWidth,
		mainHeight, // fixed height for main view,
		miniHeight, // fixed LANE height for mini view,
		totalHeight;

	var x, x1, y1, y2;

	function computeScales() {

		totalWidth = $('#john_anchor_1').width() - m[1] - m[3];
		mainHeight = 600; // fixed height for main view,
		miniHeight = laneLength * 14; // fixed LANE height for mini view,
		totalHeight = mainHeight + miniHeight + 30;
		//scales
		x = d3.scale.linear()
			.domain([timeBegin, timeEnd])
			.range([0, totalWidth]);
		x1 = d3.scale.linear()
			.range([0, totalWidth]);
		y1 = d3.scale.linear()
			.domain([0, visibleLanes.length])
			.range([0, mainHeight]);
		y2 = d3.scale.linear()
			.domain([0, laneLength])
			.range([0, miniHeight]);
	}

	computeScales();

	$( window).resize(function() {
  		computeScales();
	});


	// create the chart as an svg element
	var chart = d3.select(main_anchor)
				.append("svg")
				.attr("width", '100%') // width is defined in CSS
				//.attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
				.attr("height", totalHeight + m[0] + m[2])
				.attr("class", "chart");

	// and assign callback to play button
	var start_button = d3.select('.button.play').on("click", function() {
							start_callback(TheSharedTime);
						});


	// define a clip-path matching main height to prevent rects to spread ontop of lanes names
	chart.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", totalWidth)
		.attr("height", mainHeight);

	// definit les attributs d'affichage pour main et mini
	var main = chart.append("g")
				.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
				.attr("width", totalWidth)
				.attr("height", mainHeight)
				.attr("class", "main");
	var mini = chart.append("g")
				.attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0] + 20) + ")")
				.attr("width", totalWidth)
				.attr("height", miniHeight)
				.attr("class", "mini");

	//main lanes lines and players names
	main.append("g").selectAll(".laneLines")
		.data(visibleLanesItems)
		.enter().append("line")
		.attr("x1", m[1])
		.attr("y1", function(d, i) {return y1(i);})
		.attr("x2", totalWidth)
		.attr("y2", function(d, i) {return y1(i);})
		.attr("stroke", "#657b83")
	main.append("g").selectAll(".laneText")
		.data(visibleLanesItems)
		.enter().append("text")
		.text(function(d) {return d;})
		.attr("x", -m[1])
		.attr("y", function(d, i) {return y1(i + .5);})
		.attr("dy", ".5ex")
		.attr("text-anchor", "end")
		//.attr("class", function(d, i) {return "laneText" + ' colorClass' + i;});
		.attr("class", 'laneText');
		//.style("fill", function(d, i) {return "hsl(" + i / laneLength * 360. + ",70%,50%)";});// a color for each lane
 

	//mini lanes and texts
	mini.append("g").selectAll(".laneLines")
		.data(items)
		.enter().append("line")
		.attr("x1", m[1])
		.attr("y1", function(d) {return y2(d.lane);})
		.attr("x2", totalWidth)
		.attr("y2", function(d) {return y2(d.lane);})
		.attr("stroke", "lightgray");
	var miniLaneText = mini.append("g").selectAll(".laneText")
		.data(lanes)
		.enter().append("text")
		.text(function(d) {return d;})
		.attr("_laneid", function(d, i){return i;})
		.attr("x", -m[1])
		.attr("y", function(d, i) {return y2(i + .5);})
		.attr("dy", ".5ex")
		.attr("text-anchor", "end")
		.attr("class", "laneText");
		//.style("fill", function(d, i) {return "hsl(" + i / laneLength * 360. + ",50%,40%)";}); // a color for each lane



	var itemRects = main.append("g")
						.attr("clip-path", "url(#clip)");

	//mini item rects
	mini.append("g").selectAll("miniItems")
		.data(items)
		.enter().append("rect")
		.attr("class", function(d) {return "miniItem" + d.lane + ' colorClass' + (d.lane%8);})
		.attr("x", function(d) {return x(d.start);})
		.attr("y", function(d) {return y2(d.lane + .5) - 5;})
		.attr("width", function(d) {return x(d.end - d.start);})
		.attr("height", 12)
		//.style("fill", function(d, i) {return "hsl(" + d.lane / laneLength * 360. + ",50%,40%)";}) // a color for each lane
		.style("fill-opacity", "0.7");

	//mini labels
	mini.append("g").selectAll(".miniLabels")
		.data(items)
		.enter().append("text")
		.text(function(d) {return d.karma + ' - ' + d.nuance;})
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

	var rects, karmaLabels, nuanceLabels, rbrushes, deleteButtons;
	var deleteButtonsSize = 10;

	// toggle lane visibility by clicking on miniLane texts
	miniLaneText.on('click', function(){
		//var theQuery = this.getAttribute('lane');
		// var theQuery = {'_id':this.getAttribute('_id')};
		var laneID = Number(this.getAttribute('_laneid'));
		var index = visibleLanes.indexOf(laneID);
   		if (index === -1) {
   		    visibleLanes.push(laneID);
   		} else {
   		    visibleLanes.splice(index, 1);
   		}
   		console.log(visibleLanes);
		computeScales();
   		display();
	});

	function display() {


		var minExtent = brush.extent()[0],
			maxExtent = Math.min(timeEnd, brush.extent()[1]);

		// get a list with items inside the brush' scope
		var	visItems = items.filter(function(d) {return d.start < maxExtent && d.end > minExtent;});

		// mask hidden lanes
		visItems = visItems.filter(function(d) { return (($.inArray(d.lane, visibleLanes))!=-1)});

		mini.select(".brush")
			.call(brush.extent([minExtent, maxExtent]));

		x1.domain([minExtent, maxExtent]);

		// update x-axis for main view (disabled while overlaying mini-lane)
		//main.selectAll('.x.axis').remove();
		//main.append("g")
      	//	.attr("class", "x axis")
      	//	.attr("transform", "translate(0," + mainHeight + ")")
      	//	.call(xAxis2);

		var solarizePalette = ["#b58900", "#cb4b16", "#dc322f", "#d33682", "#6c71c4", "#268bd2", "#2aa198", "#859900"];

		//update main item rects
		rects = itemRects.selectAll("rect")
			.data(visItems, function(d) { return d._id; })
			.attr("x", function(d) {return x1(d.start);})
			.attr("y", function(d) {return y1(($.inArray(d.lane, visibleLanes))) + 5;})
			.attr("height", function(d) {return .9 * y1(1);})
			.attr("width", function(d) {return x1(d.end) - x1(d.start);})
			.attr("z-index", function(d){return d.start;});
		rects.enter().append("rect")
			.attr("class", function(d) {return "miniItem" + d.lane + ' colorClass' + (d.lane%8);})
			.attr("x", function(d) {return x1(d.start);})
			//.attr("y", function(d) {return y1(d.lane) + 5;})
			.attr("y", function(d) {return y1(($.inArray(d.lane, visibleLanes))) + 5;})
			.attr("width", function(d) {return x1(d.end) - x1(d.start);})
			.attr("height", function(d) {return .9 * y1(1);})
			.style("stroke-width", "3")
			.style("stroke", "#073642")
			//.style("fill", function(d, i) {return "hsl(" + d.lane / laneLength * 360. + ",70%,40%)";}) // a color for each lane
			.style("fill-opacity", "1")
			.attr("z-index", function(d){return d.start;})
			.call(drag);
		rects.exit().remove();

		deleteButtons = itemRects.selectAll("rect.deleteButtons")
			.data(visItems, function(d) { return d._id; })
			.attr("x", function(d) {return (x1(d.end) - deleteButtonsSize);})
			.attr("width", function(d) {return deleteButtonsSize;})
			.attr("z-index", function(d){return d.start;});
		deleteButtons.enter().append("rect")
			.attr("class", function(d) {return "deleteButtons";})
			.attr("x", function(d) {return (x1(d.end) - deleteButtonsSize);})
			//.attr("y", function(d) {return y1(d.lane) + 5;})
			.attr("y", function(d) {return y1(($.inArray(d.lane, visibleLanes))) + 5;})
			.attr("width", function(d) {return deleteButtonsSize;})
			.attr("height", function(d) {return deleteButtonsSize;})
			.attr("_id", function(d){return d._id;})
			.style("stroke-width", "1")
			.style("stroke", "rgb(0,0,0)")
			.attr("z-index", function(d){return d.start;})
			.style("fill", function(d, i) {return "hsl(" + d.lane / laneLength * 360. + ",10%,10%)";}) // a color for each lane
			.style("fill-opacity", "0.7");
		deleteButtons.exit().remove();
		// updates rbrushes
		//rbrushes = 

		//update the item karmas
		karmaLabels = itemRects.selectAll('.karmaLabel')
			.data(visItems, function (d) { return d._id; })
			.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 1);});
		karmaLabels.enter().append("text")
			.text(function(d) {return (d.karma + ' - ' + (d.end - d.start));})
			.attr("class", "karmaLabel")
			.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);})
			//.attr("y", function(d) {return y1(d.lane + .4);})
			.attr("y", function(d) {return y1($.inArray(d.lane, visibleLanes)+ 0.4);})
			.attr("_id", function(d){return d._id;})
			.attr("text-anchor", "start")
			.attr("z-index", function(d){return d.start;});
		karmaLabels.exit().remove();

		nuanceLabels = itemRects.selectAll('.nuanceLabel')
			.data(visItems, function (d) { return d._id; })
			.attr("y", function(d) {return y1($.inArray(d.lane, visibleLanes)+ .75);})
			.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);});
		nuanceLabels.enter().append("text")
			.text(function(d) {return  (d.nuance);})
			.attr("class", "nuanceLabel")
			.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);})
			//.attr("y", function(d) {return y1(d.lane + .75);})
			.attr("y", function(d) {return y1($.inArray(d.lane, visibleLanes)+ .75);})
			.attr("_id", function(d){return d._id;})
			.attr("text-anchor", "start")
			.attr("z-index", function(d){return d.start;});
		nuanceLabels.exit().remove();


		// delete buttons action
		deleteButtons.on('click', function(){
			var theQuery = {'_id':this.getAttribute('_id')};
			Meteor.call('removeSequences', theQuery);
		});
	}




	var currentTime = 0;
	var brushSize = 500;
	var timeOffset;
	var requestId = undefined;

	function animate() {

		var playingSpeed = 1;
		currentTime = playingSpeed * ( TheSharedTime - timeOffset ) / 1000;
		//console.log(TheSharedTime);

		var currentTimeFormatted = new Date(null);
		currentTimeFormatted.setSeconds(currentTime); // specify value for SECONDS here
		currentTimeFormatted = currentTimeFormatted.toISOString().substr(11, 8);

		// sequenceTimeDisplay.text("current time : " + currentTime.toFixed(2) + "s");
		$('.john-header-playbar .current_time').text(currentTimeFormatted);

		// make condition that stop cursor if time exceeds graph domain
		if (currentTime > timeEnd ) {
			playing = 0;
			console.log("time overflow");
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
			.call(brush.extent([currentTime, Math.min(timeEnd,currentTime+brushSize)]));
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
		console.log(d3.event, d3.event);
		
		var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];

		console.log('min/max brush', minExtent, maxExtent);

		var thisDatum = d;
		x1.domain([0, maxExtent-minExtent]);

		var newPosition = Math.max(0, Math.min(totalWidth - 10, jUtils.roundN(d3.event.x, x1(10))));
		var newWidth = Math.max(jUtils.roundN(d3.event.y,x1(10)), 10);

		// move item rect
		d3.select(this)
			.attr("x", newPosition)
			.attr("width", newWidth);
		// move deleteButton
		d3.select("rect[_id='"+d._id+"']")
				.attr("x", newPosition + newWidth - deleteButtonsSize);
		// move labels
		d3.select(".karmaLabel[_id='"+d._id+"']")
				.attr("x", newPosition + 2);

		d3.select(".nuanceLabel[_id='"+d._id+"']")
				.attr("x", newPosition + 2);
	}
	
	function dragend(d) {
		//console.log(d3.select(this));
		//console.log(xb(d3.select(this)[0][0].x.baseVal.value));
		//console.log(d);

		d3.select(this).style("stroke", "black");

		// toggle selection
		d.selected = !d.selected;

		if (d.selected)	d3.select(this).style("fill", "red")
			else d3.select(this).style("fill", function(d, i) {return "hsl(" + d.lane / laneLength * 360. + ",50%,40%)";});
	
	  	var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];

		//x1.domain([0, maxExtent-minExtent]);

		// scale function from graph position to data value
		var invX = d3.scale.linear()
				.domain([0, totalWidth])
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
		Sequences.update({"_id":d._id}, {"lane":d.lane, "karma": d.karma, "nuance": d.nuance, "start":d.start, "end":d.end });

		//console.log(Sequences.find({}).fetch());

	}

};

