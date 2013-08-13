'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  
  .factory('apiService', function($http, $q, $rootScope) {
	  
	  return {
	    
	    search : function(request){
	        
		    return $.ajax({
	      	type : 'POST',
	      	data : JSON.stringify(request),
	      	dataType : 'json',
	      	contentType: 'application/json',
	      	url: 'api/search'
	      })
	    }
		}
	});
