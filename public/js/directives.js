'use strict';

/* Directives */

function isEmpty(value) {
    return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

angular.module('myApp.directives', [])

    .directive('ngMin', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMin, function () {
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            var minValidator = function (value) {
                var min = scope.$eval(attr.ngMin) || 0;
                if (!isEmpty(value) && value < min) {
                    ctrl.$setValidity('ngMin', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMin', true);
                    return value;
                }
            };

            ctrl.$parsers.push(minValidator);
            ctrl.$formatters.push(minValidator);
        }
    };
})

.directive('ngMax', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMax, function () {
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            var maxValidator = function (value) {
                var max = scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && value > max) {
                    ctrl.$setValidity('ngMax', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMax', true);
                    return value;
                }
            };

            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }
    };
})

    .directive('dnetwork', function(apiService, $routeParams, $timeout,$rootScope) {
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
                var h = $(window).height()-$(".controls").height()*2.5;

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

                    var gpath = svg.append("g").attr("class","paths");
                    var gcircle = svg.append("g").attr("class","circles");
                    var gtext = svg.append("g").attr("class","texts");

                var netreq = {
                    id:scope.articleId,
                    relevance : scope.relevance,
                    rarity : scope.rarity,
                    top : scope.cut
                }

                apiService.associations(netreq).done(function (data) {

                    scope.drawNet(data);

                });

                scope.drawNet = function(data) {

                    //scope.clicked = false;
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


                        data.nodes.forEach(function(d,i){
                            d.x = Math.random()*w;
                            d.y= Math.random()*h;
                        })

                        var force = d3.layout.force()
                            .nodes(data.nodes)
                            .links(edges)
                            .size([width, height])
                            .linkDistance(70)
                            .charge(-200)
                            .gravity(0.2)
                            .friction(0.8)
                            .on("tick", tick)
                            .start();



                        // Per-type markers, as they don't inherit styles.
                       


                        var path = gpath.selectAll("path")
                            .data(force.links(),function(d) { return d.source.id + "-" + d.target.id; });


                           

                            path.enter().append("path");
                           // .attr("class", function(d) { return "link " + d.type; })
                           // .style("marker-end", "url(#arrow)");

                            path.exit().remove();

                        var circle = gcircle.selectAll("circle")
                            .data(force.nodes(),function(d) { return d.id;});

                          
                            circle.enter().append("circle")
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

                            circle.exit().remove();

                             circle.filter(function(d){
                                return d.id === scope.terms[0]
                            })
                             .attr("r",12);

                            circle.filter(function(d){
                                return d.id !== scope.terms[0] && scope.terms.indexOf(d.id)>-1
                            }).attr("entity","")
                            .on("click",function(d){
                                
                                if(!scope.clicked) {
                                    d3.event.stopPropagation();
                                    scope.clicked = true;

                                    $timeout(function(){
                                        scope.$apply();
                                    });

                                    var netreq = {
                                       action:'graph',
                                        article : $routeParams.id
                                    }

                                    apiService.click(netreq).done(function () {
                                        console.log("done click report")
                                    });

                                    path.style("opacity", 0);
                                    circle.style("opacity", 0);
                                    text.style("opacity", 0);

                                    var pf = pathFinder(data.original.associations, d.id);
                                    var names = pf.names;
                                    scope.selected = d.id;
                                    scope.paths = pf.paths;
                                   // scope.$apply();
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


                        var text = gtext.selectAll("text")
                            .data(force.nodes(),function(d) { return d.id;});

                            text.exit().remove();


                            text.enter().append("text")
                            .text(function(d) { return d.label.replace(/_/g," "); });

                            text.attr("x", function(d) {
                                if (scope.terms.indexOf(d.id) > -1) return 8;
                                else return 10000;
                            })
                            .attr("y", ".31em")


                             text.filter(function(d){
                                return d.id === scope.terms[0]
                            })
                             .attr("x",12);



                            if(scope.selected) {

                                path.style("opacity", 0);
                                circle.style("opacity", 0);
                                text.style("opacity", 0);

                                var pf = pathFinder(data.original.associations, scope.selected);
                                if (pf !== null) {
                                    var names = pf.names;
                                    //scope.selected = d.id;
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
                                        .attr("x", 8)
                                        .style("opacity", 1);

                                }
                                else scope.paths = [];
                                scope.$apply();


                            }
                            

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
                }

                function deselect(unclick) {

                    scope.closePopup();

                    if (d3.event.defaultPrevented) return;

                    if(unclick) {
                        scope.clicked = false;
                        scope.selected = null;
                        $timeout(function(){
                            scope.$apply();
                        });

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

                         if(!newTot.length) return null;


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


            }
        };
    })
    .directive('popOver', function(apiService, $rootScope) {
        return {
            restrict: 'C',
            link: function(scope, element, attr) {

                scope.toolt = "";

                var position = element[0].getBoundingClientRect();


                $(element).bind('click',function(e) {

                            $rootScope.open = true;



                            var value = $(element).attr("ids");

                            if (!scope.names.hasOwnProperty(value)) {


                                $(".artooltip span").html('<i class="fa fa-spinner fa-spin"></i>');
                                $(".artooltip").css({"left": e.pageX-$(".artooltip").width()/2, top:  e.pageY - $(".artooltip").height()- 70})
                                $(".artooltip").show();
                                var netreq = {entity: value};


                                apiService.abstract(netreq).done(function (data) {

                                    var abst = data.abstract.length >= 150 ? data.abstract.substr(0, 147) + "..." : data.abstract;

                                    abst = abst + "<br/><br/><b><a href='http://en.wikipedia.org/wiki/"+value+"'>Wikipedia article</a></b>"

                                    scope.toolt = abst;
                                    scope.names[value] = abst;

                                    $(".artooltip span").html(scope.toolt);
                                })
                            }
                            else {
                                console.log("knew that");
                                scope.toolt = scope.names[value];
                                $(".artooltip span").html(scope.toolt);
                                $(".artooltip").css({"left": e.pageX-$(".artooltip").width()/2, top:  e.pageY - $(".artooltip").height()- 70})
                                $(".artooltip").show();
                            }

                })

            }
        }
    });
        
 
