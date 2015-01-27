'use strict';

/* Directives */

angular.module('myApp.directives', [])

    .directive('simpleGraph', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                var chart = d3.linked()
                    .height(400)
                    .width(element.width())

                function update() {

                    d3.select(element[0])
                        .datum(angular.copy(scope.graph))
                        .call(chart)
                }

                scope.$watch('graph', function (graph) {
                    if (!graph) return;
                    update();
                })

                function onResize(e, ui) {
                    chart.height(ui.element.height());
                    update();
                }

                var timer;

                element.parent().bind('resize', function (e, ui) {
                    timer && clearTimeout(timer);
                    timer = setTimeout(function () {
                        onResize(e, ui);
                    }, 0);
                });

            }
        }
    })

    .directive('routeGraph', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                var chart = d3.route()
                    .height(400)
                    .width(element.width())

                function update() {

                    d3.select(element[0])
                        .datum(angular.copy(scope.graph))
                        .call(chart)
                }

                scope.$watch('graph', function (graph, oldGraph) {
                    if (!graph) return;
                    if (graph != oldGraph) chart.resetZoom();
                    update();
                })

                function onResize(e, ui) {
                    chart.height(ui.element.height());
                    update();
                }

                var timer;

                element.parent().bind('resize', function (e, ui) {
                    timer && clearTimeout(timer);
                    timer = setTimeout(function () {
                        onResize(e, ui);
                    }, 0);
                });

            }
        }
    })


    .directive('resizable', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                attrs.handles = attrs.handles || "e, s, se";
                attrs.options = attrs.options || {};

                var options = {

                    handles: attrs.handles,

                    resize: function (event, ui) {
                        ui.element.css("position", "fixed");
                        ui.element.css("bottom", "0px");
                        ui.element.css("top", "");
                    }
                }

                options = angular.extend(options, attrs.options);
                $(element).resizable(options)

            }
        }
    })

    .directive('bslider', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                attrs.min = +attrs.min || 1;
                attrs.max = +attrs.max || 5
                attrs.step = +attrs.step || 1;
                attrs.value = +scope[attrs.model] || +attrs.value || 1;
                attrs.orientation = attrs.orientation || "horizontal";
                attrs.selection = attrs.selection || "after";
                attrs.tooltip = attrs.tooltip || "show";
                attrs.options = attrs.options || {};

                var options = {
                    'min': attrs.min,
                    'max': attrs.max,
                    'value': attrs.value,
                    'step': attrs.step,
                    'orientation': attrs.orientation,
                    'selection': attrs.selection,
                    'tooltip': attrs.tooltip
                }

                options = angular.extend(options, attrs.options);

                var slider = $(element).slider(options)
                    .on('slideStop', function (event) {
                        scope[attrs.model] = event.value;
                        scope.$apply();
                    })

            }
        }
    })
    .directive('dnetwork', function(apiService, $rootScope) {
        return {
            restrict: 'E',
            replace: false,
            //scope: { articleId: '=' },
            template: '<div id="netviz">',
            link: function postLink(scope, element, attrs) {

                function redraw() {
                    svg.attr("transform",
                            "translate(" + d3.event.translate + ")"
                            + " scale(" + d3.event.scale + ")");
                }


                var d3Container = element.find('#netviz')[0],
                    container = d3.select(element[0]);

                var w = $("#tab_default_1").innerWidth();
                var h = $(window).height()-$(".nav-tabs").innerHeight();

                if(container.select("svg").empty()) {
                    container.append("svg").attr("width",w).attr("height",h);
                }

                var svg = container.select("svg")
                    //.attr("viewBox", "0 0 " + width + " " + height )
                    .attr("preserveAspectRatio", "xMidYMid meet")
                    .attr("pointer-events", "all")
                    .on("click",function() {
                        if(scope.clicked) {
                            deselect(true);
                        }

                    })
                    .call(d3.behavior.zoom().on("zoom", redraw))
                    .append("g")


                scope.netReq = {
                    id:scope.articleId
                };

                apiService.completeNetwork(scope.netReq)
                    .done(function (data) {

                        console.log(data);
                        scope.clicked = false;
                        scope.terms=data.terms;
                        scope.$apply();
                        //$rootScope.$broadcast("terms",)
                        var width = w,
                            height=h;

                        var edges = [];
                        data.edges.forEach(function(e) {

                            var sourceNode = data.nodes.filter(function(n) {
                                    return n.id === e.source;
                                })[0],
                                targetNode = data.nodes.filter(function(n) {
                                    return n.id === e.target;
                                })[0];

                            edges.push({
                                source: sourceNode,
                                target: targetNode
                                //value: e.Value
                            });

                        });

                        var force = d3.layout.force()
                            .nodes(data.nodes)
                            .links(edges)
                            .size([width, height])
                            .linkDistance(70)
                            .charge(-350)
                            .gravity(0.2)
                            .friction(0.9)
                            .on("tick", tick)
                            .start();



                        // Per-type markers, as they don't inherit styles.
                        svg.append("defs").append("marker")
                            .attr("id", "arrow")
                            .attr("viewBox", "0 -5 10 10")
                            .attr("refX", 15)
                            .attr("refY", -1.5)
                            .attr("markerWidth", 6)
                            .attr("markerHeight", 6)
                            .attr("orient", "auto")
                            .append("path")
                            .attr("d", "M0,-5L10,0L0,5");


                        var path = svg.append("g").selectAll("path")
                            .data(force.links(),function(d) { return d.source.id + "-" + d.target.id; })
                            .enter().append("path")
                           // .attr("class", function(d) { return "link " + d.type; })
                           // .style("marker-end", "url(#arrow)");

                        var circle = svg.append("g").selectAll("circle")
                            .data(force.nodes(),function(d) { return d.id;})
                            .enter().append("circle")
                            .attr("r", 6)

                            .style("fill",function(d){
                                if(scope.terms.indexOf(d.id)>-1) return "#f7ec79";
                                else return "#ddd";
                            })
                            .call(force.drag)
                            .on("mouseover",function(d){
                                if(!scope.clicked) {
                                    circle.style("opacity", 0.3);
                                    path.style("opacity", 0.3);
                                    text.style("opacity", 0.3);

                                    d3.select(this).style("opacity", 1);
                                    path.filter(function (e) {
                                        return e.target.id == d.id || e.source.id == d.id
                                    })
                                        .style("opacity", 1)
                                        .each(function (e, j) {
                                            circle.filter(function (f) {
                                                return f.id == e.target.id || f.id == e.source.id
                                            })
                                                .style("opacity", 1);

                                        })
                                    text.filter(function (f) {
                                        return f.id === d.id
                                    })
                                        .attr("x", 8)
                                        .style("opacity", 1);
                                }
                            })
                            .on("mouseout",function(d) {
                                if(!scope.clicked) {
                                   deselect(false);
                                }
                            });

                            circle.filter(function(d){
                                return d.id !== scope.terms[0] && scope.terms.indexOf(d.id)>-1
                            })
                            .on("click",function(d){
                                console.log("click me!",d);
                                if(!scope.clicked) {
                                    d3.event.stopPropagation();
                                    scope.clicked = true;

                                    path.style("opacity", 0);
                                    circle.style("opacity", 0);
                                    text.style("opacity", 0);

                                    var pf = pathFinder(data.original.associations, d.id);
                                    var names = pf.names;
                                    scope.selected = d.id;
                                    scope.paths = pf.paths;
                                    scope.$apply();
                                        path.filter(function (e) {
                                        return names.indexOf(e.target.id) > -1 && names.indexOf(e.source.id) > -1
                                    })
                                        .style("opacity", 1);

                                    circle.filter(function (e) {
                                        return names.indexOf(e.id) > -1
                                    })
                                        .style("opacity", 1);

                                    text.filter(function (e) {
                                        return names.indexOf(e.id) > -1
                                    })
                                        .attr("x",8)
                                        .style("opacity", 1);

                                }
                                else deselect(true);
                            })


                        var text = svg.append("g").selectAll("text")
                            .data(force.nodes(),function(d) { return d.id;})
                            .enter().append("text")
                            .attr("x", function(d) {
                                if (scope.terms.indexOf(d.id) > -1) return 8;
                                else return 10000;
                            })
                            .attr("y", ".31em")
                            .text(function(d) { return d.label.replace(/_/g," "); });

// Use elliptical arc path segments to doubly-encode directionality.
                        function tick() {
                            path.attr("d", linkArc);
                            circle.attr("transform", transform);
                            text.attr("transform", transform);
                        }

                        function linkArc(d) {
                            var dx = d.target.x - d.source.x,
                                dy = d.target.y - d.source.y,
                                dr = Math.sqrt(dx * dx + dy * dy);
                            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                        }

                        function transform(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        }

                    })

                function deselect(unclick) {

                    if(unclick) {
                        scope.clicked = false;
                        scope.selected = null;
                        scope.$apply();
                    }
                    d3.selectAll("svg circle").style("opacity", 1);
                    d3.selectAll("svg path").style("opacity", 1);
                    d3.selectAll("svg text").style("opacity", 1)
                        .attr("x", function (d) {
                            if (scope.terms.indexOf(d.id) > -1) return 8;
                            else return 10000;
                        })
                }

                     function pathFinder(paths,name) {
                        var tot = [];
                        var res = [];
                         for(var k in paths) {
                             tot = tot.concat(paths[k]);
                         }

                         var newTot = tot.filter(function(d){
                             var l = d.steps.length-1;
                             var n = d.steps[l].destination;
                             //console.log(n,name,n===name);
                             return n === name;
                         })

                         res.push(newTot[0].source);
                         newTot.forEach(function(e,j){

                             e.steps.forEach(function(f,k){

                                if(res.indexOf(f.destination)==-1) res.push(f.destination);
                             })
                         })
                            return {paths:newTot, names:res};
                     }
            }
        }
    })
    .directive('network', function (apiService) {
        return {
            restrict: 'E',
            replace: false,
            //scope: { articleId: '=' },
            templateUrl: 'templates/network.html',
            link: function postLink(scope, element, attrs) {
                scope.articleId = 1;
                scope.isCollapsed = true;

                var sigmaContainer = element.find('#sigma-container')[0],
                    container = d3.select(element[0]),
                    chart = d3.select(sigmaContainer);

                    var network = dacena.graph()
                        /*.on('filtered', function (d) {

                            if (!d.nodeID) {
                                scope.selected = undefined;
                                scope.isCollapsed = true;
                                if (!scope.$$phase) {
                                    scope.$apply();
                                }
                            } else {

                                scope.selectedNode = d.nodes.filter(function (d) {
                                    return d.selected;
                                })[0];

                                network.centerView(scope.selectedNode);

                                scope.attrs = d3.entries(scope.selectedNode.attributes);

                                scope.linkedNodes = d.nodes.filter(function (d) {
                                    return !d.selected;
                                });

                                scope.edges = edgesDirection(d.nodeID, d.edges);


                                scope.isCollapsed = false;

                                if (!scope.$$phase) {
                                    scope.$apply();
                                }
                            }

                        });*/


                //scope.indexes = JSON.parse(attrs.directiveData);
                //scope.index = scope.indexes[0];


                scope.updateNetwork = function (d) {
                    chart.call(network.setSelectedNode(d.id));
                };

                var edgesDirection = function (nodeID, edges) {

                    var outgoing = {}, incoming = {}, mutual = {};

                    edges.forEach(function (d) {
                        if (nodeID === d.source) {
                            outgoing[d.id] = d;
                        } else if (nodeID === d.target) {
                            incoming[d.id] = d;
                        }
                    });

                    for (var e in outgoing) {
                        if (e in incoming) {
                            mutual[e] = outgoing[e];
                            delete incoming[e];
                            delete outgoing[e];
                        }
                    }

                    return {outgoing: d3.values(outgoing), incoming: d3.values(incoming), mutual: d3.values(mutual)};

                };

                container.select('#in').on('click', function () {
                    network.zoomIn();
                });

                container.select('#out').on('click', function () {
                    network.zoomOut();
                });

                container.select('#reset').on('click', function () {
                    network.zoomReset();
                });

                var update = function () {

                    //var label = data.label;
                    scope.netReq = {
                        id:scope.articleId
                    };

                    apiService.completeNetwork(scope.netReq)
                        .done(function (data) {

                            //scope.bipartite = true; //to change w/ data.settings.bipartite when added to source json
                            scope.bipartite = data.settings.bipartite;
                            scope.nodes = data.nodes;
                            scope.nodesLabel = function (id) {
                                var node = scope.nodes.filter(function (d) {
                                    return d.id === id;
                                });

                                return node[0];
                            };


                            scope.selected = undefined;
                            scope.isCollapsed = true;

                            if (!scope.bipartite) {
                                scope.linksLegend = {
                                    outgoing: data.settings.outgoing,
                                    incoming: data.settings.incoming,
                                    mutual: data.settings.mutual
                                }
                            }

                            var settings = {
                                labelThreshold: data.settings.labelThreshold,
                                font: 'Source Sans Pro',
                                mouseWheelEnabled: false
                            }


                            network.settings(settings);

                            network.label("lol!")

                            chart.datum(data).call(network);
                            network.zoomReset()

                        },
                        function (error) {
                            var txt = error;
                            element.html(txt);
                        }
                    );
                }

                update();

               /* scope.$watch('index', function (newValue, oldValue) {
                    var check = angular.equals(newValue, oldValue);
                    if (!check) {

                        update(newValue);

                    }
                });*/

            }
        };
    });
        
 
