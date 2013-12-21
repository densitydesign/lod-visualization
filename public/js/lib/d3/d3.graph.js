(function(){

	d3 = window.d3 || {};

	d3.graph = function (){

		var width = 800,
				height = 600;

		function chart(selection){
			selection.each(function (data) {
				
				selection
				    .attr("width", width)
				    .attr("height", height);

				selection.selectAll("*").remove();

				var force = d3.layout.force()
				    .charge(-120)
				    .linkDistance(100)
				    .size([width, height]);

				var nodes = data.instances.map(function (n){ return n.id; })

				data.links.forEach(function (link){
					link.source = nodes.indexOf(link.source.id);
					link.target = nodes.indexOf(link.target.id)
				})

			  force
			      .nodes(data.instances)
			      .links(data.links)
			      .start();

			  var link = selection.selectAll(".link")
			      .data(data.links)
			    .enter().append("line")
			      .attr("class", "link")
			      //.style("stroke-width", function(d) { return Math.sqrt(d.value); });

			  var node = selection.selectAll(".node")
			      .data(data.instances)
			    .enter().append("circle")
			      .attr("class", "node")
			      .attr("r", 5)
			      .style("fill", function(d) { return "#777" })
			      .call(force.drag);

			  node.append("title")
			      .text(function(d) { return d.name; });

			  force.on("tick", function() {
			    link.attr("x1", function(d) { return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; });

			    node.attr("cx", function(d) { return d.x; })
			        .attr("cy", function(d) { return d.y; });
			  });
				
			});
		}

		return chart;
	}

})();