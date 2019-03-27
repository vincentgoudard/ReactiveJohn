/*
 * John
 *
 *
 */

export const John = { extensions: {} };
import '../client/lib/utils.js';

var brushSize = 500;
var mainPlayheadOffset = 100;


John.create = function (Sequences, lanes, items, currentTime, main_anchor, start_callback) {
	console.log("John < john created");
	// clear whatever already exists in main anchor
	d3.select(main_anchor).html("");

	this.items = items;

	var selectedEvents = [];

	var wasPlaying = false;

	var displayTime = currentTime;

	// build playhead object
	var playHeadDatum = [{'x':displayTime}];

	var playheadMagnetismSuspend = 0;

	var timeQuantum = 1;


	this.setTime = function(time) {
		displayTime = time;
		playHeadDatum[0].x = displayTime;
		animate();
	}

	// define drag callbacks on items
	var drag = d3.behavior.drag()
				.origin(function(d) { return {x:0,y:0}; })
    			.on("dragstart", dragstart)
    			.on("drag", dragmove)
    			.on("dragend", dragend);

    // define drag callbacks on dragbars
	var dragLeft = d3.behavior.drag()
				.origin(function(d) { return {x:0,y:0}; })
    			.on("dragstart", dragbarLstart)
    			.on("drag", dragbarLmove)
    			.on("dragend", dragbarLend);
    var dragRight = d3.behavior.drag()
				.origin(function(d) { return {x:0,y:0}; })
    			.on("dragstart", dragbarRstart)
    			.on("drag", dragbarRmove)
    			.on("dragend", dragbarRend);

    // define drag callbacks on dragbars
	var dragTime = d3.behavior.drag()
				.origin(function(d) { return {x:x(d.x),y:0}; })
    			.on("dragstart", dragTimeStart)
    			.on("drag", dragTimeMove)
    			.on("dragend", dragTimeEnd);


	var laneLength = lanes.length;

	// visibleLanes defines the indices of visible lanes
	visibleLanes = [];
	for(var i = 0; i < laneLength; i++) {
	    visibleLanes.push(i);
	}
	// console.log(visibleLanes);

	// filter out elements from score which do not belong to visible lanes
	visibleLanesItems = lanes.filter(function(d, i) { return (($.inArray(i, visibleLanes))!=-1)});


	// find biggest value for time end
	var timeBegin = 0, timeEnd = 0;
	for(var i=0; i < items.length; i++) {
		if( items[i].end > timeEnd) timeEnd = items[i].end;
	}

	//console.log("max time: ", timeEnd);
	//console.log("dyn-width", $('#john_anchor_1').width());


	// définit les dimensions du graph
	var m = [20, 15, 15, 120], //top right bottom left
		//w = 1200 - m[1] - m[3],
		//totalWidth = 1200 - m[1] - m[3],
		totalWidth,
		mainHeight, // fixed height for main view,
		miniHeight, // fixed LANE height for mini view,
		totalHeight;

	var x, x1, y1, y2;
	// dimensions de la dragbar
    var dragbarWidth = 3;

    //var dragRight = d3.behavior.drag()
    //	.origin(Object)
    //	.on("drag", rdragresize);



	function computeScales() {

		totalWidth = $('#john_anchor_1').width() - m[1] - m[3];
		mainHeight = 580; // fixed height for main view,
		miniHeight = laneLength * 14; // fixed LANE height for mini view,
		totalHeight = mainHeight + miniHeight + 30;
	
		//scales
		// convert full score time to full graphics width (for mini lanes)
		x = d3.scale.linear()
			.domain([timeBegin, timeEnd])
			.range([0, totalWidth]);
		// convert some domain to full graphics width
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
	var start_button = d3.select('.btn.play').on("click", function() {
							start_callback(displayTime);
						});
	// and assign callback to play button
	var rewind_button = d3.select('.btn.rewind').on("click", function() {
						});


	// define a clip-path matching main height to prevent rects to spread ontop of lanes names
	chart.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", totalWidth)
		.attr("height", mainHeight);

	// Create svg groups
	var main = chart.append("g");
	var mini = chart.append("g");
	var mainlaneLines = main.append("g");
	var mainlaneText = main.append("g");

	main.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
		.attr("width", totalWidth)
		.attr("height", mainHeight)
		.attr("class", "main");
	mini.attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0] + 20) + ")")
		.attr("width", totalWidth)
		.attr("height", miniHeight)
		.attr("class", "mini");

	var mainPlayhead = main.append("line")
	 	.attr("x1", 0)
	 	.attr("y1", -5)
	 	.attr("x2", 0)
	 	.attr("y2", mainHeight+5)
	 	.attr("stroke-width", 4)
	 	.attr("stroke", "#F00");

	//main lanes lines and players names
	mainlaneLines.selectAll(".laneLines")
		.data(visibleLanesItems)
		.enter().append("line")
		.attr("x1", m[1])
		.attr("y1", function(d, i) {return y1(i);})
		.attr("x2", totalWidth)
		.attr("y2", function(d, i) {return y1(i);})
		.attr("stroke", "#657b83");
		
	mainlaneText.selectAll(".laneText")
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

	mini.append("g").selectAll(".laneLines")
		.data(lanes)
		.enter().append("line")
		.attr("x1", m[1])
		.attr("y1", function(d, i) {return y2(i);})
		.attr("x2", totalWidth)
		.attr("y2", function(d, i) {return y2(i);})
		.attr("class", function(d, i) {return "miniItem separatorLine" + ' laneIndex' + (i%8);})
		.attr("stroke", "#657b83");

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
		.style("fill-opacity", "0.7")
		.style("stroke-width", "1")
		.style("stroke", "#073642")
		.attr("z-index", function(d){return d.start;});


	//mini labels
	mini.append("g").selectAll(".miniLabels")
		.data(items)
		.enter().append("text")
		.text(function(d) {return d.karma + ' - ' + d.nuance;})
		.attr("x", function(d) {return x(d.start) + 1;})
		.attr("y", function(d) {return y2(d.lane + .5);})
		.attr("dy", ".5ex")
		.attr("z-index", function(d){return d.start;});


	//brush - define the "brush" (selected area) and make the display() function the listener when brush moves
	var brush = d3.svg.brush()
						.x(x)
						.on("brush", display) /*choix entre brushstart, brush, brushend*/
						.on("brushstart", function(){playheadMagnetismSuspend=1;})
						.on("brushend", function(){playheadMagnetismSuspend=0;});

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

    // time cursor handle
   	mini.append("g")
		.datum(playHeadDatum)
		.append("rect")
		.attr("class", "timeCursorHandle")
		.attr("x", function(d) {return d.x;})
		//.attr("x", 0)
		.attr("y", -10)
		.attr("width", 1)
		.attr("height", miniHeight+20)
		.style("fill-opacity", "0.5")
		.style("stroke-width", "2")
		.style("stroke", "#F00")
		.call(dragTime);
	//console.log("playHeadDatum",playHeadDatum[0].x );


	mainlaneText.selectAll(".laneText")
		.data(visibleLanesItems)
		.enter().append("text")
		.text(function(d) {return d;})
		.attr("x", -m[1])
		.attr("y", function(d, i) {return y1(i + .5);})
		.attr("dy", ".5ex")
		.attr("text-anchor", "end")
		//.attr("class", function(d, i) {return "laneText" + ' colorClass' + i;});
		.attr("class", 'laneText');


	var rects, dragbarleft, dragbarright, timeCursorHandle, karmaLabels, nuanceLabels, rbrushes, deleteButtons;
	var deleteButtonsSize = 10;

	// toggle lane visibility by clicking on miniLane texts
	miniLaneText.on('click', function(){

		//temporarily de-activate this
		//var laneID = Number(this.getAttribute('_laneid'));
		//var index = visibleLanes.indexOf(laneID);
   		//if (index === -1) {
   		//    visibleLanes.push(laneID);
   		//} else {
   		//    visibleLanes.splice(index, 1);
   		//}
   		//console.log(visibleLanes);
		//computeScales();
   		//display();
	});


	function display() {

		var minExtent = brush.extent()[0],
			maxExtent = Math.min(timeEnd, brush.extent()[1]);

		// update brushSize so that it remains the same when John is re-created
		brushSize = maxExtent - minExtent;

		// get a list with items inside the brush' scope
		var	visItems = items.filter(function(d) {return d.start < maxExtent && d.end > (minExtent - mainPlayheadOffset);});
		// mask hidden lanes
		visItems = visItems.filter(function(d) { return (($.inArray(d.lane, visibleLanes))!=-1)});

		mini.select(".brush")
			.call(brush.extent([minExtent, maxExtent]));

		x1.domain([minExtent - mainPlayheadOffset, maxExtent]);

		// update x-axis for main view (disabled while overlaying mini-lane)
		//main.selectAll('.x.axis').remove();
		//main.append("g")
      	//	.attr("class", "x axis")
      	//	.attr("transform", "translate(0," + mainHeight + ")")
      	//	.call(xAxis2);

		var solarizePalette = ["#b58900", "#cb4b16", "#dc322f", "#d33682", "#6c71c4", "#268bd2", "#2aa198", "#859900"];


		// playhead sur le main display
		//x1.domain([minExtent - 100, maxExtent]);
	
		mainPlayhead.attr("x1", x1(displayTime))
				 	.attr("x2", x1(displayTime))
				 	.attr("y1", -5)
	 				.attr("y2", mainHeight+5)
	 				.attr("z-index", -99999999999);

		//update main item rects
		rects = itemRects.selectAll("rect")
			.data(visItems, function(d) { return d._id; })
			.attr("x", function(d) {return x1(d.start);})
			.attr("y", function(d) {return y1(($.inArray(d.lane, visibleLanes))) + 5;})
			.attr("_id", function(d){return 'mainItem'+d._id;})
			.attr("height", function(d) {return .9 * y1(1);})
			.attr("width", function(d) {return x1(d.end) - x1(d.start);})
			.attr("z-index", function(d){return d.start;});
		rects.enter().append("rect")
			.attr("class", function(d) {return "mainItem lane" + d.lane + ' colorClass' + (d.lane%8);})
			.attr("x", function(d) {return x1(d.start);})
			//.attr("y", function(d) {return y1(d.lane) + 5;})
			.attr("_id", function(d){return 'mainItem'+d._id;})
			.attr("y", function(d) {return y1(($.inArray(d.lane, visibleLanes))) + 5;})
			.attr("width", function(d) {return x1(d.end) - x1(d.start);})
			.attr("height", function(d) {return .9 * y1(1);})
			.style("stroke-width", "3")
			//.style("stroke", "#073642")
			//.style("fill", function(d, i) {return "hsl(" + d.lane / laneLength * 360. + ",70%,40%)";}) // a color for each lane
			.style("fill-opacity", "1")
			.attr("z-index", function(d){return d.start;})
			.call(drag);
		rects.exit().remove();

      	dragbarleft = itemRects.selectAll("rect.dragbarleft")
			.data(visItems, function(d) { return d._id; })
			.attr("x", function(d) {return x1(d.start);})
			.attr("width", function(d) {return dragbarWidth;})
			.attr("z-index", function(d){return d.start;});
		dragbarleft.enter().append("rect")
			.attr("class", function(d) {return "dragbarleft";})
			.attr("x", function(d) {return x1(d.start);})
			.attr("y", function(d) {return y1(($.inArray(d.lane, visibleLanes))) + 5;})
			.attr("width", function(d) {return dragbarWidth;})
			.attr("height", function(d) {return .9 * y1(1);})
			.attr("_id", function(d){return d._id;})
			.style("stroke-width", "1")
			.style("stroke", "rgb(0,0,0)")
			.attr("z-index", function(d){return d.start;})
			.style("fill", "#000")
			.style("fill-opacity", "0.3")
			.attr("cursor", "ew-resize")
      		.call(dragLeft);
		dragbarleft.exit().remove();

		dragbarright = itemRects.selectAll("rect.dragbarright")
			.data(visItems, function(d) { return d._id; })
			.attr("x", function(d) {return x1(d.end);})
			.attr("width", function(d) {return dragbarWidth;})
			.attr("z-index", function(d){return d.start;});
		dragbarright.enter().append("rect")
			.attr("class", function(d) {return "dragbarright";})
			.attr("x", function(d) {return x1(d.end);})
			.attr("y", function(d) {return y1(($.inArray(d.lane, visibleLanes))) + 5;})
			.attr("width", function(d) {return dragbarWidth;})
			.attr("height", function(d) {return .9 * y1(1);})
			.attr("_id", function(d){return d._id;})
			.style("stroke-width", "1")
			.style("stroke", "rgb(0,0,0)")
			.attr("z-index", function(d){return d.start;})
			.style("fill", "#000")
			.style("fill-opacity", "0.3")
			.attr("cursor", "ew-resize")
      		.call(dragRight);
		dragbarright.exit().remove();


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

		//update the item karmas
		karmaLabels = itemRects.selectAll('.karmaLabel')
			.data(visItems, function (d) { return d._id; })
			.text(function(d) {
				var duration = Math.ceil(Math.max(0, Math.min((d.end - displayTime), (d.end - d.start))));
				var formattedDuration = jUtils.formatTime(duration);
				return (d.karma + ' - ' + formattedDuration);
			})
			.attr("x", function(d) {
				var textLength = document.getElementById(d._id).getComputedTextLength() + 12;
				return Math.max(x1(d.start) + 12, Math.min(x1(d.end) - textLength, x1(displayTime) - textLength));
			});
		karmaLabels.enter().append("text")
			.text(function(d) {
				var duration = Math.ceil(Math.max(0, Math.min((d.end - displayTime), (d.end - d.start))));
				var formattedDuration = jUtils.formatTime(duration);
				return (d.karma + ' - ' + formattedDuration);
			})
			.attr("class", "karmaLabel")
			.attr("x", function(d) {return x1(Math.max(d.start, minExtent-mainPlayheadOffset)) + 12;})
			.attr("y", function(d) {return y1($.inArray(d.lane, visibleLanes)+ 0.4);})
			.attr("_id", function(d){return d._id;})
			.attr("id", function(d){return d._id;})
			.attr("text-anchor", "start")
			.attr("z-index", function(d){return d.start;});
		
		karmaLabels.exit().remove();

		nuanceLabels = itemRects.selectAll('.nuanceLabel')
			.data(visItems, function (d) { return d._id; })
			.attr("x", function(d) {
				var textLength = document.getElementById(d._id+"_nuance").getComputedTextLength() + 12;
				return Math.max(x1(d.start) + 12, Math.min(x1(d.end) - textLength, x1(displayTime) - textLength));
			})

			.attr("y", function(d) {return y1($.inArray(d.lane, visibleLanes)+ .75);});
		nuanceLabels.enter().append("text")
			.text(function(d) {return  (d.nuance);})
			.attr("class", "nuanceLabel")
			.attr("y", function(d) {return y1($.inArray(d.lane, visibleLanes)+ .75);})
			.attr("_id", function(d){return d._id;})
			.attr("id", function(d){return d._id+"_nuance";})
			.attr("text-anchor", "start")
			.attr("z-index", function(d){return d.start;});
		nuanceLabels.exit().remove();

		timeCursorHandle = mini.select('.timeCursorHandle')
			.data(playHeadDatum)
			.attr("x", function(d) {return x(d.x);});

		// delete buttons action
		deleteButtons.on('click', function(){
			var theQuery = {'_id':this.getAttribute('_id')};
			Meteor.call('removeSequences', theQuery);
		});
	}

	var requestId = undefined;

	function animate() {

		var displayTimeFormatted = new Date(null);
		displayTimeFormatted.setSeconds(displayTime); // specify value for SECONDS here
		displayTimeFormatted = displayTimeFormatted.toISOString().substr(11, 8);

		$('.john-header-playbar .current_time').text(displayTimeFormatted);

		// make condition that stop cursor if time exceeds graph domain
		if (displayTime > timeEnd ) {
			playing = 0;
			console.log('John < time overflow');
			return;
		}

		//should be done only if brush is locked on playhead
		if (!playheadMagnetismSuspend){
			mini.select(".brush")
			.call(brush.extent([displayTime, displayTime+brush.extent()[1]-brush.extent()[0]]));
		}

		display();

		//var text = chart.selectAll("text")
		//						.enter()
		//						.append("text");
	}

	// init display
	function init(){

		mini.select(".brush")
			.call(brush.extent([displayTime, Math.min(timeEnd,displayTime+brushSize)]));
		display();
	}

	init();

	// add a "selected" field for events
	items.forEach(function(obj){obj.selected = false});


	//// Drag function attached to the mainItem ////
	function dragstart(d) {
		//d3.select(this).style("stroke", "red");
		playheadMagnetismSuspend = 1;
	}
	function dragmove(d) {		
		var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];

		var invX = d3.scale.linear()
				.domain([0, totalWidth])
				.range([0, maxExtent-minExtent]);

		// compute new start time based on X-axis drag
		var newStartTime = Math.max(jUtils.roundN(d.start + invX(d3.event.x), timeQuantum), 0);
		x1.domain([minExtent, maxExtent]);
		// convert it to new position
		var newPosition = x1(newStartTime);

		// compute new duration based on Y-axis drag
		var oldDuration = d.end - d.start;
		var newDuration = Math.max(jUtils.roundN(oldDuration + invX(d3.event.y), timeQuantum), timeQuantum);
		// convert it to new width
		x1.domain([0, maxExtent-minExtent]);
		var newWidth = x1(newDuration);


		var newEndTime = newStartTime + newDuration;

		// move item rect
		d3.select(this)
			.attr("x", newPosition)
			.attr("width", newWidth);
		// move deleteButton
		d3.select("rect.deleteButtons[_id='"+d._id+"']")
				.attr("x", newPosition + newWidth - deleteButtonsSize);
		// move labels
		d3.select(".karmaLabel[_id='"+d._id+"']")
				.attr("x", newPosition + 12)
				.text(function(d) {
					var duration = Math.ceil(Math.min((newEndTime - displayTime), newDuration));
					var formattedDuration = jUtils.formatTime(duration);
					return (d.karma + ' - ' + formattedDuration);
			});
		d3.select(".nuanceLabel[_id='"+d._id+"']")
				.attr("x", newPosition + 12);
		// move dragbars
		d3.select(".dragbarleft[_id='"+d._id+"']")
				.attr("x", newPosition);
		d3.select(".dragbarright[_id='"+d._id+"']")
				.attr("x", newPosition + newWidth);
	}	


	function dragend(d) {
		// toggle selection and update selection color class
		d.selected = !d.selected;
		
		if (d.selected)	d3.select(this).classed('selected',true);
			else d3.select(this).classed('selected',false);
		
		// scale function from graph position to data value
	  	var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];
		var invX = d3.scale.linear()
				.domain([0, totalWidth])
				.range([minExtent, maxExtent]);
		var newStart = jUtils.roundN(invX(this.getAttribute('x')*1), timeQuantum);
		invX.range([0, maxExtent - minExtent]);
		var newDuration = jUtils.roundN(invX(this.getAttribute('width')*1), timeQuantum); // *1 converts string to number

		// convert graph position to data value
		d.start = newStart; // 
		d.end = d.start + newDuration;
	
		// update mongo collection
		Sequences.update({"_id":d._id}, {"lane":d.lane, "karma": d.karma, "nuance": d.nuance, "start":d.start, "end":d.end });

		playheadMagnetismSuspend = 1;
	}


	//// Drag function attached to the left dragbar ////
	function dragbarLstart(d) {
		d3.select(this).style("stroke", "red");
	}
	function dragbarLmove(d) {

		var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];

		var invX = d3.scale.linear()
				.domain([0, totalWidth])
				.range([0, maxExtent-minExtent]);

		// compute new start time based on X-axis drag
		var newStartTime = Math.min(jUtils.roundN(d.start + invX(d3.event.x), timeQuantum), (d.end - timeQuantum));
		x1.domain([minExtent, maxExtent]);
		// convert it to new position
		var newPosition = x1(newStartTime);

		//compute new duration
		var newDuration = d.end - newStartTime;

    	//move the right drag handle
    	d3.select(this).attr("x", newPosition);
		// move deleteButton
		d3.select("rect[_id=mainItem"+d._id+"]")
				.attr("x", newPosition)
				.attr("width", function(d) {return x1(d.end) - newPosition;})
		// move labels
		d3.select(".karmaLabel[_id='"+d._id+"']")
				.attr("x", newPosition + 12)
				.text(function(d) {
					var formattedDuration = jUtils.formatTime(newDuration);
					return (d.karma + ' - ' + formattedDuration);
				});
		d3.select(".nuanceLabel[_id='"+d._id+"']")
				.attr("x", newPosition + 12);
	}
	function dragbarLend(d) {
		d3.select(this).style("stroke", "black");
	
		// retrieve "parent" item which this dragbar refers to
		var parentItem = (d3.select("rect[_id=mainItem"+d._id+"]"))[0][0];

		// scale function from graph position to data value
	  	var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];
		var invX = d3.scale.linear()
				.domain([0, totalWidth])
				.range([minExtent, maxExtent]);
		var newStart = jUtils.roundN(invX(parentItem.getAttribute('x')*1), timeQuantum);
		invX.range([0, maxExtent - minExtent]);
		var newDuration = jUtils.roundN(invX(parentItem.getAttribute('width')*1), timeQuantum); // *1 converts string to number

		// convert graph position to data value
		d.start = newStart; // 
		d.end = d.start + newDuration;
		// update mongo collection
		Sequences.update({"_id":d._id}, {"lane":d.lane, "karma": d.karma, "nuance": d.nuance, "start":d.start, "end":d.end });
	}

	//// Drag function attached to the left dragbar ////
	function dragbarRstart(d) {
		d3.select(this).style("stroke", "red");
	}
	function dragbarRmove(d) {

		var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];

		var invX = d3.scale.linear()
				.domain([0, totalWidth])
				.range([0, maxExtent-minExtent]);

		// compute new start time based on X-axis drag
		var newEndTime = Math.max(jUtils.roundN(d.end + invX(d3.event.x), timeQuantum), (d.start + timeQuantum));
		x1.domain([minExtent, maxExtent]);
		// convert it to new position
		var newRightHandlePosition = x1(newEndTime);

		//compute new duration
		var newDuration = newEndTime - d.start;

    	//move the right drag handle
    	d3.select(this).attr("x", newRightHandlePosition);
		// move deleteButton
		d3.select("rect[_id=mainItem"+d._id+"]")
				.attr("width", function(d) {return newRightHandlePosition - x1(d.start);})
		// move labels
		d3.select(".karmaLabel[_id='"+d._id+"']")
				.text(function(d) {
					var formattedDuration = jUtils.formatTime(newDuration);
					return (d.karma + ' - ' + formattedDuration);
				});
		// update delete button position
		d3.select("rect.deleteButtons[_id='"+d._id+"']")
				.attr("x", newRightHandlePosition - deleteButtonsSize);	
	}
	function dragbarRend(d) {
		d3.select(this).style("stroke", "black");
	
		// retrieve "parent" item which this dragbar refers to
		var parentItem = (d3.select("rect[_id=mainItem"+d._id+"]"))[0][0];

		// scale function from graph position to data value
	  	var minExtent = brush.extent()[0],
			maxExtent = brush.extent()[1];
		var invX = d3.scale.linear()
				.domain([0, totalWidth])
				.range([minExtent, maxExtent]);
		var newStart = jUtils.roundN(invX(parentItem.getAttribute('x')*1), timeQuantum);
		invX.range([0, maxExtent - minExtent]);
		var newDuration = jUtils.roundN(invX(parentItem.getAttribute('width')*1), timeQuantum); // *1 converts string to number

		// convert graph position to data value
		d.end = d.start + newDuration;
		// update mongo collection
		Sequences.update({"_id":d._id}, {"lane":d.lane, "karma": d.karma, "nuance": d.nuance, "start":d.start, "end":d.end });
	}

		//// Drag function attached to the left dragbar ////
	function dragTimeStart(d) {
		console.log('start');
	}
	function dragTimeMove(d) {
		console.log('move', d3.event.x);
		var newPosition = Math.max(0, Math.min(totalWidth - 10, d3.event.x));//Math.max(0, Math.min(totalWidth - 10, jUtils.roundN(d3.event.x, x1(10))));
		// move playhead rect
		console.log('newPosition', newPosition);
		d3.select(this)
			.attr("x", newPosition);

		var invX = d3.scale.linear()
			.domain([0, totalWidth])
			.range([timeBegin, timeEnd]);
		newTimeLocation = invX(newPosition);
		playHeadDatum[0].x = newTimeLocation;
		displayTime = newTimeLocation;


		animate();	
	}

	function dragTimeEnd(d) {
		console.log('end');
		if (transportLock){
			Meteor.call('setServerTime', newTimeLocation);
		}
		else{
			local_currentTime = newTimeLocation;
		}
	}

};