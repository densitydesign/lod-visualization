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
    .directive('network', function (fileService) {
        return {
            restrict: 'A',
            replace: false,
            templateUrl: 'views/templates/network.html',
            link: function postLink(scope, element, attrs) {

                scope.isCollapsed = true;

                var sigmaContainer = element.find('#sigma-container')[0],
                    container = d3.select(element[0]),
                    chart = d3.select(sigmaContainer),
                    network = dacena.graph()
                        .on('filtered', function (d) {

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

                        });


                scope.indexes = JSON.parse(attrs.directiveData);
                scope.index = scope.indexes[0];


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

                var update = function (data) {

                    var label = data.label;
                    fileService.getFile(data.url).then(
                        function (data) {

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

                            network.label(label)

                            chart.datum(data).call(network);
                            network.zoomReset()

                        },
                        function (error) {
                            var txt = error;
                            element.html(txt);
                        }
                    );
                }

                update(scope.index);

                scope.$watch('index', function (newValue, oldValue) {
                    var check = angular.equals(newValue, oldValue);
                    if (!check) {

                        update(newValue);

                    }
                });

            }
        };
    });
        
 
