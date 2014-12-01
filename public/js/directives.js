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
                console.log(attrs)
                var slider = $(element).slider(options)
                    .on('slideStop', function (event) {
                        scope[attrs.model] = event.value;
                        scope.$apply();
                    })

            }
        }
    })
    .directive('dnetwork', function(apiService) {
        return {
            restrict: 'E',
            replace: false,
            //scope: { articleId: '=' },
            template: '<div id="netviz">',
            link: function postLink(scope, element, attrs) {

                var d3Container = element.find('#netviz')[0],
                    container = d3.select(element[0]);

                if(container.select("svg").empty()) {
                    container.append("svg").attr("width","100%").attr("height",600);
                }

                var svg = container.select("svg");

                scope.netReq = {
                    id:scope.articleId
                };

                apiService.completeNetwork(scope.netReq)
                    .done(function (data) {

                        var width = 1200,
                            height=600;

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
                            .linkDistance(100)
                            .charge(-280)
                            .gravity(0.2)
                            .friction(0.9)
                            .on("tick", tick)
                            .start();


                        console.log(force.links(),force.nodes());

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
                            .on("click",function(d){console.log(d)})
                            .style("fill",function(d){
                                if(scope.terms.indexOf(d.id)>-1) return "#f7ec79";
                                else return "#ddd";
                            })
                            .call(force.drag);

                        var text = svg.append("g").selectAll("text")
                            .data(force.nodes(),function(d) { return d.id;})
                            .enter().append("text")
                            .attr("x", 8)
                            .attr("y", ".31em")
                            .text(function(d) { return d.name; });

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
                            console.log(scope.nodes);
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
        
 
