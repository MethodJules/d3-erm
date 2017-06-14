// ****************************************************
// VALIDATION
// validate the erm model and bring it in a form D3 can use
// ****************************************************
function validate(erm){
    erm.references = [] // we need a array of the refrences to create the links in D3

    // clean up entities
    for (var i in erm.entities) {
        // if no database is set for an entity than get the one from the group
        if (typeof erm.entities[i].database === 'undefined') {
	    var g = $.grep(erm.groups, function(e){ return e.name == erm.entities[i].group; });
	    erm.entities[i].database = g[0].database
        }
        
        var color = ""
        // if no olor is set for an entity than get the one from the group
        if (typeof erm.entities[i].color === 'undefined') {
	    var g = $.grep(erm.groups, function(e){ return e.name == erm.entities[i].group; });
            color = g[0].color;
	    erm.entities[i].color = color
        }
        
        // push all references in the global reference array
        for (var j in erm.entities[i].references) {
            erm.entities[i].references[j].color = color;
	    erm.references.push(erm.entities[i].references[j])
	}
    }
    return erm;
}

// ****************************************************
// DEFINITIONS
// gloabl definitions that must stand at the beginning
// ****************************************************

// tooltip for entities
var tipEnt = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) { 
        var html = ""
	    + "<h1><span>"+d.name+"</span></h1>"
	    + "<p><span>Type: </span> " + d.type + "</p>"
	    + "<p><span>Description:</span> " + d.description + "</p>"
	    + "<p><span>Database:</span> " + d.database + "</p>"
	return html; 
    });

// tooltip for attributes
var tipAttr = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) { 
        var html = ""
	    + "<h1><span>"+d.name+"</span></h1>"
            + "<p><span>Type: </span> " + d.type + "</p>"
	    + "<p><span>Description:</span> " + d.description + "</p>"
	    + "<p><span>Primary Key:</span> " + ((d.primary) ? "Yes":"No") + "</p>"
	    + "<p><span>Foreign Key:</span> " + ((d.foreign) ? "Yes":"No") + "</p>"
        return html; 
    });

// tooltip for references
var tipRef = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) { 
        var html = ""
	    + "<p><span>Source: </span> " + d.source.name +"."+d.sourceAttribute+"</p>"
	    + "<p><span>Target:</span> " + d.target.name +"."+d.targetAttribute+"</p>"
	    + "<p><span>Type:</span> " + d.sourceType +":"+d.targetType+"</p>"
	return html; 
})

// getFrontColor uses tinycolor to get a good readable color 
// based on the background color
function getFrontColor(bgcolor){
    var bgc = tinycolor(bgcolor);
    if (bgc.isLight())			
        return tinycolor(bgc).darken(35).toHexString();
    else	
	return tinycolor(bgc).lighten(35).toHexString();
}
// ****************************************************
// INIT
// init the drawing area
// ****************************************************

var model = validate(erm); // validate erm into model for d3

var container = document.getElementById("container"); // get the div container where we render everything into

var width = container.clientWidth;      // get the width of the container which is equal to the window with
var height = container.clientHeight;    // get the height of the container which is equal to the window height

// create the svg in the size of the window
var svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", resetHighlight);

// resetHighlight removes all highlights
// it is trigger when the user clicks somewhere in the SVG
function resetHighlight() {
    d3.selectAll(".entity").select("rect").classed("highlight", false);	
    d3.selectAll(".entity").select("circle").classed("highlight", false);
    d3.selectAll(".reference").classed("highlight", false);
    d3.selectAll(".reference").attr('marker-mid', function(d){
        return "url(#arrowhead" + d.source.group + ")";
    })
    d3.selectAll("text").classed("highlightText", false);
}
// create a group where we attache all elements to
var view = svg.append("g")
    .attr("class", "view");

// append a unvisible circle to the svg
// this circle is later used to attach the tooltip
// to the path of the reference to
// display the reference tooltip at the correct position
svg.append('circle').attr('id', 'tipfollowscursor');

// init tooltips
svg.call(tipAttr);
svg.call(tipRef);
svg.call(tipEnt);
// ****************************************************
// SVG DEFINITIONS
// define global svg stuff like markers
// ****************************************************

var defs = svg.append('defs');

// arrow with the style for highlightet references
defs.append('marker')
    .attr('id',function(){return'arrowheadhighlight'})
    .attr('viewBox','-5 -5 10 10')
    .attr('refX',0)
    .attr('refY',0)
    .attr('orient','auto')
    .attr('markerWidth',5)
    .attr('markerHeight',5)
    .attr('xoverflow','visible')
    .append('svg:path')
        .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
        .attr('fill', "#E91E63")

// create arrows for each group with the group color
model.groups.forEach(function(group){
    defs.append('marker')
        .attr('id',function(){return'arrowhead'+group.name})
        .attr('viewBox','-5 -5 10 10')
        .attr('refX',0)
        .attr('refY',0)
        .attr('orient','auto')
        .attr('markerWidth',5)
        .attr('markerHeight',5)
        .attr('xoverflow','visible')
        .append('svg:path')
            .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
            .attr('fill', function(){return getFrontColor(group.color)})
});

// ****************************************************
// ZOOM
// define the zoom functionality
// ****************************************************
var zoom = d3.zoom()
    .on("zoom", zoomed);

function zoomed() {
    view.attr("transform", d3.event.transform);
}

svg.call(zoom);
zoom.scaleTo(svg, 0.5);

// ****************************************************
// SOFTWARE NOTICE
// add the link to d3-erm
// ****************************************************
svg.append("g")
    .attr("class", "software")
    .append("a")
        .attr("xlink:href", "https://github.com/michaelkrnac/d3-erm")
        .attr("target", "_blank")
    .append("text")	
        .text("created with d3-erm")
    .attr("transform", function() { 
        var x = width - this.getBBox().width - 20;
	var y = height -20;
	return "translate("+x+"," + y +")";
    })

// ****************************************************
// TITLE BLOCK
// add the references to the view
// ****************************************************
var titleblock = svg.append("g")
    .attr("class", "titleblock")
    .attr("transform", function() { 
        var y = height -60;
	return "translate(20," + y +")";
    })

titleblock.append("text")	
    .attr("class", "title")
    .text(model.info.title)
    
titleblock.append("text")	
    .attr("class", "author")
    .text("Author: " + model.info.author)	
    .attr("y", 20)

titleblock
    .append("text")	
    .attr("class", "version")
    .text("Version: " + model.info.version)	
    .attr("y", 40);

// ****************************************************
// FORCE SIMULATION CONFIUGRATION
// set up the force simulation
// ****************************************************
var forceCollide = d3.forceCollide()
    .radius(function(d) {
        var n = d3.select("#"+d.name).node();
	var h = n.getBBox().height;
	var w = n.getBBox().width;
	// calculate diagonale and use the half + offset
	return (Math.sqrt(Math.pow(h,2)+Math.pow(w,2))/2)+20
    });


function forceCluster(alpha) {
    for (var i = 0, n = model.entities.length, entity, group, k = alpha * 0.03; i < n; ++i) {
        entity = model.entities[i];
        group =  $.grep(model.entities, function(e){ return e.group == entity.group; });
        entity.vx -= (entity.x - group[0].x) * k;
        entity.vy -= (entity.y - group[0].y) * k;
    }
}

var simulation = d3.forceSimulation()        
    .velocityDecay(0.3)
    .force("charge", d3.forceManyBody())  
    .force("center", d3.forceCenter(width /2, height /3))
    .force("x", d3.forceX().strength(0.1))
    .force("y", d3.forceY().strength(0.1))
    .force("link", d3.forceLink().id(function(d) { return d.name; }).distance(1).strength(0.4))
    .force("cluster", forceCluster)
    .force("collide", forceCollide)    

// ****************************************************
// REFERENCES
// add the references to the view
// ****************************************************
var reference = view
    .append("g")
    .attr("class", "references")
    .selectAll(".reference")
    .data(model.references)
    .enter()
    .append("path")
    .attr("class", "reference")  
    .attr('marker-mid', function(d){
        var e = $.grep(model.entities, function(e){ return e.name == d.source; });
	return "url(#arrowhead" + e[0].group + ")";
    })
    .attr("id", function(d){return d.source+"---"+d.target})
    .style("stroke", function(d) {return getFrontColor(d.color);})
    .on('click', highlightReference)
    .on('mouseover', function(d,e){
        var target = d3.select('#tipfollowscursor')
        .attr('cx', d3.event.offsetX)
        .attr('cy', d3.event.offsetY - 5) // 5 pixels above the cursor
        .node();
	
        tipRef.show(d, target);
    })
    .on('mouseout', tipRef.hide);

function highlightReference(d){
	d3.select(this).classed("highlight", true);
	d3.select(this).attr("marker-mid", "url(#arrowheadhighlight)");
	d3.select("#"+d.source.name).select("rect").classed("highlight", true);
	d3.select("#"+d.target.name).select("rect").classed("highlight", true);
	d3.select("#"+d.source.name).select("circle").classed("highlight", true);
	d3.select("#"+d.target.name).select("circle").classed("highlight", true);
	d3.select("text[id='"+d.source.name+"."+d.sourceAttribute+"']").classed("highlightText", true);
	d3.select("text[id='"+d.target.name+"."+d.targetAttribute+"']").classed("highlightText", true);
	d3.event.stopPropagation();
}

// ****************************************************
// ENTITIES
// add the entites to the view
// ****************************************************
var entity = view
    .append("g")
    .attr("class", "entites")
    .selectAll(".entity")
    .data(model.entities)
    .enter().append("g")
    .attr("class", "entity")
    .attr("id", function(d){return d.name;})
    .on('click', highlightEntity)
    .call(
        d3.drag()
    	    .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );    

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

function highlightEntity(d){
    d3.select(this).select("rect").classed("highlight", true);
    d3.select(this).select("circle").classed("highlight", true);
    var refs = $.grep(model.references, function(e){ return e.source.name == d.name; });
    refs.forEach(function(ref) {
        d3.select("#"+ref.target.name).select("rect").classed("highlight", true);
	d3.select("#"+ref.target.name).select("circle").classed("highlight", true);
	d3.select("#"+ref.source.name+"---"+ref.target.name).classed("highlight", true);	
	d3.select("#"+ref.source.name+"---"+ref.target.name).attr("marker-mid", "url(#arrowheadhighlight)");
    }); 	
    d3.event.stopPropagation();
}

// add circle to center of entity
var circle = entity.append("circle")
    .attr("r", 5)		
    .attr("fill", function(d) {
        var g = $.grep(model.groups, function(e){ return e.name == d.group; });
	return getFrontColor(g[0].color)
    })

// add rectangle to entity
var rect = entity.append("rect")
    .attr("rx",2)
    .attr("ry",2)
    .attr("fill", function(d) { return d.color})
    .attr("stroke", function(d) { return getFrontColor(d.color);
    })

// add the visuell identifer to the entity
var image = entity.append("image")
    .attr("xlink:href", function(d) {
        var g = $.grep(model.groups, function(e){ return e.name == d.group; });
	return g[0].vid
    })
    .attr("width", 16)
    .attr("height", 16)
    .attr("x", 10)
    .attr("y", 10);

// add the title
var title = entity.append("a")
    .attr("xlink:href", function(d){return d.url})
    .attr("target", "_blank")
    .append("text")
    .attr("x", 36)
    .attr("y", 23)
    .attr("class", "entitytitle")
    .text(function(d) { return d.name })
    .attr("fill", function(d) {
        var g = $.grep(model.groups, function(e){ return e.name == d.group; });
	return getFrontColor(g[0].color);
    })
    .on('mouseover', tipEnt.show)
    .on('mouseout', tipEnt.hide);

// add the attributes
var attribute = entity.selectAll(".attribute")
    .data(function(d){return d.attributes})
    .enter().append("text")
    .text(function(d) { return d.name })
    .attr("class", function(d){
        classes = "attribute";
	if (d.primary !== 'undefined') {
	    if (d.primary)
	        classes = classes + " primary";
	}
        if (d.foreign !== 'undefined') {
	    if (d.foreign)
		classes = classes + " foreign";
	}
	return classes;
    })
    .attr("id", function(d){
        return d3.select(this.parentNode).attr("id") + "."+ d.name;
    })
    .attr("x", 36)
    .attr("y", function (d,i){return 30+(i+1)*20})
    .attr("fill", function(d) {
        return getFrontColor(d3.select(this.parentNode).select("rect").attr("fill"));
    })
    .on('mouseover', tipAttr.show)
    .on('mouseout', tipAttr.hide);

// recalculate the size of the rectangle
entity.selectAll('rect')
    .attr("width", function(d) {return this.parentNode.getBBox().width +36;})
    .attr("height", function(d) {return this.parentNode.getBBox().height + 20;})

// recalculate the position of the circle
entity.selectAll("circle")
    .attr("cx", function(d) {return this.parentNode.getBBox().width/2-2.5;})
    .attr("cy", function(d) {return this.parentNode.getBBox().height/2-2.5;})



// ****************************************************
// FORCE SIMULATION CONFIUGRATION
// set up the force simulation
// ****************************************************
simulation.nodes(model.entities)
simulation.force("link").links(model.references)
simulation.on("tick", ticked);

function ticked() {
    reference.attr("d", function(d) {
        // Total difference in x and y from source to target
        diffX = d.target.x - d.source.x;
        diffY = d.target.y - d.source.y;
		
	sourceCenterX = d.source.x + d3.select("#"+d.source.name).node().getBBox().width/2;
	sourceCenterY = d.source.y + d3.select("#"+d.source.name).node().getBBox().height/2;
	targetCenterX = d.target.x + d3.select("#"+d.target.name).node().getBBox().width/2;
	targetCenterY = d.target.y + d3.select("#"+d.target.name).node().getBBox().height/2;

	if (diffX == 0 && diffY == 0) {
	    // Self Reference
	    boxWidth = d3.select("#"+d.source.name).node().getBBox().width/2; 
	    var lineData = [ 
	        { "x": sourceCenterX ,   "y": sourceCenterY },  
		{ "x": sourceCenterX + boxWidth + 50 ,   "y": sourceCenterY },  
		{ "x": sourceCenterX +boxWidth + 50,   "y": sourceCenterY + boxWidth + 50},  
		{ "x": sourceCenterX ,   "y": sourceCenterY + boxWidth+ 50 },  
		{ "x":  targetCenterX,  "y":  targetCenterY }  
	    ];
	} else {
	    // Length of path from center of source node to center of target node
	    pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));
	    // x and y distances from center to outside edge of target node
	    offsetX = (diffX * d3.select("#"+d.target.name).node().getBBox().width) / pathLength;
	    offsetY = (diffY * d3.select("#"+d.target.name).node().getBBox().height) / pathLength;
	    var lineData = [ 
	        { "x": sourceCenterX ,   "y": sourceCenterY },  
		{ "x": (d.target.x-offsetX) ,   "y": (d.target.y-offsetY) },  
		{ "x":  targetCenterX,  "y":  targetCenterY }  
	    ];
	}
 			
        var lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
	    .curve(d3.curveBasis);
	return lineFunction(lineData)
    });

    entity.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}
