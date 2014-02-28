'use strict';

/* Directives */

angular.module('myApp.directives', [])

  .directive('simpleGraph', function() {
  	return {
  		restrict: 'A',
  		link: function (scope, element, attrs) {

  			var chart = d3.linked()
          .height(400)
          .width(element.width())

        function update(){

          d3.select(element[0])
            .datum(angular.copy(scope.graph))
            .call(chart)
        }
  			
  			scope.$watch('graph', function (graph){
  				if (!graph) return;
          update();
  			})

        function onResize(e, ui){
          chart.height(ui.element.height());
          update();
        }

        var timer;

        element.parent().bind('resize', function (e,ui){
           timer && clearTimeout(timer);
           timer = setTimeout(function(){ onResize(e,ui); }, 0);
        });

  		}	
  	}
  })

  .directive('routeGraph', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        var chart = d3.route()
          .height(400)
          .width(element.width())

        function update(){

          d3.select(element[0])
            .datum(angular.copy(scope.graph))
            .call(chart)
        }
        
        scope.$watch('graph', function (graph, oldGraph){
          if (!graph) return;
          if (graph != oldGraph) chart.resetZoom();
          update();
        })

        function onResize(e, ui){
          chart.height(ui.element.height());
          update();
        }

        var timer;

        element.parent().bind('resize', function (e,ui){
           timer && clearTimeout(timer);
           timer = setTimeout(function(){ onResize(e,ui); }, 0);
        });

      } 
    }
  })

  

  .directive('resizable', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        
        attrs.handles = attrs.handles || "e, s, se";
        attrs.options = attrs.options || {};
        
        var options = {
          
          handles : attrs.handles,

          resize: function(event, ui) {
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

  .directive('bslider', function() {
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
          'min' : attrs.min,
          'max' : attrs.max,
          'value' : attrs.value,
          'step' : attrs.step,
          'orientation' : attrs.orientation,
          'selection' : attrs.selection,
          'tooltip' : attrs.tooltip
        }

        options = angular.extend(options, attrs.options);
        console.log(attrs)
        var slider = $(element).slider(options)
          .on('slideStop', function (event){
            scope[attrs.model] = event.value;
            scope.$apply();
          })

      } 
    }
  });
