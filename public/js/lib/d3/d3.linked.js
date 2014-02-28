(function(){

  d3.linked = function(){

    var width, height;

    function chart(selection){
      selection.each(function (data){

        var margin = {top: 30, right: 30, bottom: 30, left: 30},
            nodeWidth = 100,
            nodeHeight = 30,
            w = (width||1000) - margin.left - margin.right;
            h = (height||400) - margin.top - margin.bottom;

        var formatNumber = d3.format(",.0f"),
            format = function(d) { return formatNumber(d) + " TWh"; },
            color = d3.scale.category20();

        selection.selectAll("*").remove();

        selection
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)

        var sankey = d3.sankey()
            .nodeWidth(nodeWidth)
            .nodePadding(10)
            .size([w, h]);

        var path = sankey
            .link()
            //.curvature(0);

        var nodes = data.instances.map(function (n){ return n.id; });

        data.links.forEach(function (link){
          link.source = nodes.indexOf(link.source.id);
          link.target = nodes.indexOf(link.target.id);
          link.value = 1;
        })

        // ok, well let's remove duplicate

        var nested = d3.nest()
          .key(function (d){ return d.source + "-" + d.target + "-" + d.property.uri; })
          .rollup(function (d) { return 0; })
          .map(data.links)

        console.log(nested)

        var newLinks = []

        data.links.forEach(function (link){
          if (nested.hasOwnProperty(link.source + "-" + link.target + "-" + link.property.uri)) {
            if (nested[link.source + "-" + link.target + "-" + link.property.uri] == 0) {
              nested[link.source + "-" + link.target + "-" + link.property.uri] = 1;
              newLinks.push(link);
            }
          }
        })

        data.links = newLinks;
        newLinks = [];

        // creating new nodes by links (unbelievable!)

        data.links.forEach(function (link){
          
          var index = data.instances.push({ isLink: true, label : link.property.label });

          var inLink = {
            source : link.source,
            target : index-1,
            value : 1,
            property : link.property
          }

          var outLink = {
            source : index-1,
            target : link.target,
            value : 1,
            property : link.property
          }

          newLinks.push(inLink)
          newLinks.push(outLink)

        })

        data.links = newLinks;

        sankey
            .nodes(data.instances)
            .links(data.links)
            .layout(50);

        data.links.forEach(function (link){
          link.dy = 0;
          link.sy = link.source.dy / 2// - nodeHeight;
          link.ty = link.target.dy / 2// - nodeHeight;
        })

        var link = selection
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .selectAll(".link")
            .data(data.links)
          .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function(d) { return nodeHeight;})//Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });

        link.append("title")
            .text(function(d) { return d.source.label + " → " + d.property.label + " → " + d.target.label });
        
        var node = selection
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .selectAll(".node")
            .data(data.instances)
          .enter().append("g")
            .attr("class", "node")
            .classed("nodelink",function(d){ return d.isLink; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
          /*.call(d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", function() { this.parentNode.appendChild(this); })
            .on("drag", dragmove));*/
          

        node.append("rect")
            .attr("height", function(d) { return nodeHeight; })//d.dy; })
            .attr("width", sankey.nodeWidth())
            .attr("y", function(d) { return (d.dy - nodeHeight) / 2; })
          //  .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
         //   .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
          .append("title")
            .text(function(d) { return d.name + "\n" + format(d.value); });

        node.append("text")
            .attr("x", nodeWidth/2)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("transform", null)
            .text(function(d) { return d.label; })
          /*.filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");*/

        //


        function dragmove(d) {
          d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(h - d.dy, d3.event.y))) + ")");
          sankey.relayout();
          data.links.forEach(function (link){
            link.dy = 0;
            link.sy = link.source.dy/2;
            link.ty = link.target.dy/2;
          })
          link.attr("d", path);
        }


      })
    }

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    }

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    }

    return chart;
  }

})();
