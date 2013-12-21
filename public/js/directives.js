'use strict';

/* Directives */

angular.module('myApp.directives', [])

  .directive('simpleGraph', function() {
  	return {
  		restrict: 'A',
  		link: function (scope, element, attrs) {

  			var chart = d3.linked();
  			
  			scope.$watch('graph', function (graph){
  				if (!graph) return;
  				console.log(graph)
  				d3.select(element[0])
  					.datum(graph)
  					.call(chart)

  			})

  		}	
  	}
  })
