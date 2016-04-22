var width = 960,
    height = 500,
    radius = 120;

// define drag callbacks
var drag = d3.behavior.drag()
    .origin(function(d) { return {x:x1(d.start),y:y1(d.lane)}; })
    .on("dragstart", dragstart)
    .on("drag", dragmove)
    .on("dragend", dragend);

//data
var lanes = ["Pierre","Serge","Laurence", "Gyorgy", "Jean", "Hugues", "Vincent"],
	laneLength = lanes.length,
	items = [{"lane": 0, "id": "Doux", "start": 5, "end": 205},
			{"lane": 0, "id": "Valse", "start": 265, "end": 420},
			{"lane": 0, "id": "Sériel", "start": 580, "end": 615},
			{"lane": 0, "id": "Explosif", "start": 620, "end": 900},
			{"lane": 1, "id": "Aquatique", "start": 960, "end": 1265},
			{"lane": 1, "id": "Géologie sonore", "start": 1270, "end": 1365},
			{"lane": 1, "id": "blabla", "start": 1370, "end": 1640},
			{"lane": 1, "id": "mécanique", "start": 1645, "end": 1910},
			{"lane": 2, "id": "Céleste", "start": 300, "end": 530},
			{"lane": 2, "id": "Vivace", "start": 550, "end": 700},
			{"lane": 2, "id": "Lento", "start": 710, "end": 790},
			{"lane": 3, "id": "à l'unison", "start": 800, "end": 1180},
			{"lane": 3, "id": "in C", "start": 1190, "end": 1330},
			{"lane": 4, "id": "crescendo", "start": 1340, "end": 1560},
			{"lane": 4, "id": "shuffling", "start": 1610, "end": 1860},
			{"lane": 4, "id": "désaccordé", "start": 1870, "end": 1900},
			{"lane": 5, "id": "cuivres", "start": 1910, "end": 1920},
			{"lane": 5, "id": "cristallin", "start": 1925, "end": 1985},
			{"lane": 5, "id": "en orbite", "start": 1990, "end": 1995},
			{"lane": 5, "id": "résonnance", "start": 10, "end": 670},
			{"lane": 5, "id": "tremblement de terre", "start": 690, "end": 900},
			{"lane": 6, "id": "lointain", "start": 920, "end": 1380},
			{"lane": 6, "id": "chuchotement", "start": 1390, "end": 1890},
			{"lane": 6, "id": "onomatopée", "start": 1900, "end": 1945}]


// find biggest value for time end
var timeBegin = 0,
	timeEnd = -Infinity;
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
// invert x-scale
var xb = d3.scale.linear()
		.domain([0, w*4])
		.range([timeBegin, timeEnd]);


// create the chart as an svg element
var chart = d3.select("body")
			.append("svg")
			.attr("width", w + m[1] + m[3])
			.attr("height", h + m[0] + m[2])
			.attr("class", "chart");

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
	.style("fill", function(d, i) {return "hsl(" + i / laneLength * 360. + ",50%,40%)";}); // a color for each lane

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
	.text(function(d) {return d.id;})
	.attr("x", function(d) {return x(d.start);})
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
	        .data(visItems, function(d) { return d.id; })
		.attr("x", function(d) {return x1(d.start);})
		.attr("width", function(d) {return x1(d.end) - x1(d.start);});
	
	rects.enter().append("rect")
		.attr("class", function(d) {return "miniItem" + d.lane;})
		.attr("x", function(d) {return x1(d.start);})
		.attr("y", function(d) {return y1(d.lane) + 5;})
		.attr("width", function(d) {return x1(d.end) - x1(d.start);})
		.attr("height", function(d) {return .8 * y1(1);})
		.call(drag);
	rects.exit().remove();

	//update the item labels
	labels = itemRects.selectAll("text")
		.data(visItems, function (d) { return d.id; })
		.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);});
	labels.enter().append("text")
		.text(function(d) {return d.id;})
		.attr("x", function(d) {return x1(Math.max(d.start, minExtent));})
		.attr("y", function(d) {return y1(d.lane + .5);})
		.attr("text-anchor", "start");
	labels.exit().remove();
}

//display();
function animateDaShit(){
	if (!requestId) {
		d3.select("body").select("#startButton").text("stop").style("background-color", "LightGreen");
		pos = 0;
		time = 0;
		animate();
	}
    else {
       d3.select("body").select("#startButton").text("start").style("background-color", "LightCoral");
       window.cancelAnimationFrame(requestId);
       requestId = undefined;
       time = 0;
    }
}

var currentTime = 0;
var brushSize = 500;
var time;
var requestId = undefined;

function animate() {
    requestId = window.requestAnimationFrame(animate);
    var now = new Date().getTime(),
        dt = now - (time || now);
 
    time = now;
 
    // Drawing code goes here... for example updating an 'x' position:
    //this.x += 10 * dt; // Increase 'x' by 10 units per millisecond
    currentTime+=dt/10;

    // make condition that stop cursor if time exceeds graph domain
    if (currentTime > timeEnd ) {
    	console.log(w);
    	window.cancelAnimationFrame(requestId);
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


//var circle = chart.selectAll("circle")
//    .data([1 / 3, 2 / 3])
//  	.enter().append("circle")
//    .datum(function(d) { return {x: width * d, y: height / 2}; })
//    .attr("r", radius)
//    .attr("cx", function(d) { return d.x; })
//    .attr("cy", function(d) { return d.y; })
//    .call(drag);

   	/// .data(visItems, function(d) { return d.id; })


function dragstart() {
  d3.select(this).style("fill", "red");
 // console.log(d3.select(this));
}

function dragmove(d) {
  //console.log(d3.event, d3.event);

  // TODO : update du data
	if (d3.select(this)[0][0].localName == "circle"){
		d3.select(this)
		    .attr("cx", d.x = Math.max(radius, Math.min(width - radius, d3.event.x)))
		    .attr("cy", d.y = Math.max(radius, Math.min(height - radius, d3.event.y)));
		}
	else if (d3.select(this)[0][0].localName == "rect"){
		d3.select(this)
		    .attr("x", d.x = Math.max(0, Math.min(width - 10, d3.event.x)));
		//labels
		    //.attr("y", d.y = Math.max(0, Math.min(height - 1000, d3.event.y)));

  	}
}

function dragend(d) {
	//console.log(d3.select(this));
	//console.log(xb(d3.select(this)[0][0].x.baseVal.value));
	console.log(d);

  	var minExtent = brush.extent()[0],
		maxExtent = brush.extent()[1];

	// color back to normal
	d3.select(this).style("fill", null);

	// update data info
	var duration = (d.end - d.start);
	d.start = xb(d3.select(this)[0][0].x.baseVal.value) + minExtent;
	d.end = d.start + duration;


	// update display to move label along
	display();
}
