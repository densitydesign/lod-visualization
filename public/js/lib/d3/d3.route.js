(function(){

  d3.route = function(){

    var width, height, zoom = d3.behavior.zoom();

    function chart(selection){
      selection.each(function (data){

        var margin = {top: 30, right: 30, bottom: 30, left: 30},
            nodeWidth = 100,
            nodeHeight = 30,
            w = (width||1000) - margin.left - margin.right;
            h = (height||400) - margin.top - margin.bottom;

        zoom
          .on("zoom", zooming)       

        selection.selectAll("*").remove();

        var main = selection
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
              .call(zoom)
           
        main
          .append("rect")
          .attr("class", "overlay")
          .attr("width", w + margin.left + margin.right)
          .attr("height", h + margin.top + margin.bottom);

        main.append("g")
          //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        
        // remove same links

        var nested = d3.nest()
          .key(unique)
          .rollup(function (d) { return 0; })
          .map(data.links)

        var uniqueLinks = []

        data.links.forEach(function (link){
          if (nested.hasOwnProperty(unique(link))) {
            if (nested[unique(link)] == 0) {
              nested[unique(link)] = 1;
              uniqueLinks.push(link);
            }
          }
        })

        data.links = uniqueLinks;


        var g = new dagreD3.Digraph();

        data.instances.forEach(function (d){
          g.addNode(d.id, { label: d.label });
        })

        data.links.forEach(function (d){
          g.addEdge(null, d.source.id, d.target.id, { label: d.property.label });
        })        

        var renderer = new dagreD3.Renderer();

        var layout = dagreD3.layout()
          .rankSep(15)
          .edgeSep(20)
          .nodeSep(15)
          .rankDir("LR");

        renderer
          .edgeInterpolate(interpolateSankey)
          //.edgeTension()
          .layout(layout).run(g, main.select("g"));

        zooming();

        function interpolateSankey(points) {
          var x0 = points[0][0], y0 = points[0][1], x1, y1, x2,
              path = [x0, ",", y0],
              i = 0,
              n = points.length;

          while (++i < n) {
            x1 = points[i][0], y1 = points[i][1], x2 = (x0 + x1) / 2;
            path.push("C", x2, ",", y0, " ", x2, ",", y1, " ", x1, ",", y1);
            x0 = x1, y0 = y1;
          }
          return path.join("");
        }

        function zooming() {
          main.select("g").attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
        }


        function unique(d){
          return d.source.id + "-" + d.target.id + "-" + d.property.uri;
        }

      })
    }

    chart.resetZoom = function() {
      zoom.scale(1).translate([0,0]);
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
