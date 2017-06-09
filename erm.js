var container = document.getElementById("container");

var width = container.clientWidth;
var height = container.clientHeight;

/* Initialize tooltip */
var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
	var html = ""
		+ "<h1><span>"+d.name+"</span></h1>"
		+ "<p><span>Type: </span> " + d.type + "</p>"
		+ "<p><span>Description:</span> " + d.description + "</p>"
	return html; 
});

var forceCollide = d3.forceCollide()
    .radius(function(d) {
			var n = d3.select("#"+d.name).node();
			var h = n.getBBox().height;
			var w = n.getBBox().width;
			if (w > h)
				return n.getBBox().width/2+20;
			else
				return n.getBBox().height/2+20; 
	});
var simulation = d3.forceSimulation()        
	.force("charge", d3.forceManyBody())  
    .force("link", d3.forceLink().id(function(d) { return d.name; }).distance(1).strength(0.1))
    .force("cluster", d3.forceLink().id(function(d) { return d.group; }).distance(1).strength(0.1))
	.force("collide", forceCollide)    
	.force("center", d3.forceCenter(width /2, height /3));

var zoom = d3.zoom()
    .scaleExtent([-100, 100])
    .translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);

var svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("height", height)
	.on("click", reset);

var view = svg.append("g")
	.attr("class", "view");

function reset() {
	d3.selectAll(".entity").select("rect").classed("highlight", false);
	d3.selectAll(".reference").classed("highlight", false);
}

var reference = view
	.append("g")
	.attr("class", "references")
	.selectAll(".reference")
	.data(model.references)
	.enter().append("path")
	.attr("class", "reference")
	.style("fill", "none")
	.on('click', highlight);

function highlight(d){
	d3.select(this).classed("highlight", true);
	d3.select("#"+d.source.name).select("rect").classed("highlight", true);
	d3.select("#"+d.target.name).select("rect").classed("highlight", true);
	d3.event.stopPropagation();
}

var entity = view
	.append("g")
	.attr("class", "entites")
	.selectAll(".entity")
 	.data(model.entities)
	.enter().append("g")
    .attr("class", "entity")
	.attr("id", function(d){return d.name;})
  	.call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));    

var rect = entity.append("rect")
	.attr("width", 20)
	.attr("height",20)
	.attr("rx",2)
	.attr("rx",2)
	.attr("fill", function(d) {
		var g = $.grep(model.groups, function(e){ return e.name == d.group; });
		return g[0].color
	});

	entity.append("image")
    	.attr("xlink:href", function(d) {
			var g = $.grep(model.groups, function(e){ return e.name == d.group; });
			return "vid/"+ g[0].vid
		})
    	.attr("width", 16)
    	.attr("height", 16)
		.attr("x", 10)
    	.attr("y", 10);


var text = entity.append("text")
	.attr("x", 36)
    .attr("y", 23)
	.style("font-weight", "bold")
    .text(function(d) { return d.name })
	.on('mouseover', tip.show)
  	.on('mouseout', tip.hide);

var attribute = entity.selectAll(".attribute")
	.data(function(d){return d.attributes})
	.enter().append("text")
    .text(function(d) { return d.name })
    .attr("class", "attribute")
	.attr("x", 36)
    .attr("y", function (d,i){return 30+(i+1)*20})
	.on('mouseover', tip.show)
  	.on('mouseout', tip.hide);

entity
	.selectAll('rect')
    .attr("width", function(d) {return this.parentNode.getBBox().width +36;})
    .attr("height", function(d) {return this.parentNode.getBBox().height + 36;})

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
        
        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        } 

function ticked() {

	reference
		.attr("d", function(d) {

           // Total difference in x and y from source to target
            diffX = d.target.x - d.source.x;
            diffY = d.target.y - d.source.y;
		
			// Length of path from center of source node to center of target node
            pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

            // x and y distances from center to outside edge of target node
            offsetX = (diffX * d3.select("#"+d.target.name).node().getBBox().width) / pathLength;
            offsetY = (diffY * d3.select("#"+d.target.name).node().getBBox().height) / pathLength;

			sourceCenterX = d.source.x + d3.select("#"+d.source.name).node().getBBox().width/2;
			sourceCenterY = d.source.y + d3.select("#"+d.source.name).node().getBBox().height/2;
			targetCenterX = d.target.x + d3.select("#"+d.target.name).node().getBBox().width/2;
			targetCenterY = d.target.y + d3.select("#"+d.target.name).node().getBBox().height/2;
		
			var lineData = [ 
					{ "x": sourceCenterX ,   "y": sourceCenterY },  
					{ "x": (d.target.x-offsetX) ,   "y": (d.target.y-offsetY) },  
				//	{ "x": (d.target.x+d.source.x)/2,  "y": d.source.y },
				//	{ "x": (d.target.x+d.source.x)/2,  "y": (d.target.y+d.source.y)/2}, 
				//	{ "x":  d.target.x,  "y": (d.target.y+d.source.y)/2},
				{ "x":  targetCenterX,  "y":  targetCenterY }  
			];
 			var lineFunction = d3.line()
                          .x(function(d) { return d.x; })
                          .y(function(d) { return d.y; })
							.curve(d3.curveBasis);
			return lineFunction(lineData)
		});

	entity.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}


simulation.nodes(model.entities)
simulation.force("link").links(model.references)
simulation.on("tick", ticked);

svg.call(zoom);
svg.call(tip);
function zoomed() {
  	view.attr("transform", d3.event.transform);
}
