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
	    },

	    articles : function(request){
	    	return $.ajax({
	      	type : 'POST',
	      	data : JSON.stringify(request),
	      	dataType : 'json',
	      	contentType: 'application/json',
	      	url: 'api/articles'
	      })
	    },

	    article : function(request){
	    	return $.ajax({
	      	type : 'POST',
	      	data : JSON.stringify(request),
	      	dataType : 'json',
	      	contentType: 'application/json',
	      	url: 'api/article'
	      })
	    },

	    associations : function(request){
	    	return $.ajax({
	      	type : 'POST',
	      	data : JSON.stringify(request),
	      	dataType : 'json',
	      	contentType: 'application/json',
	      	url: 'api/associations'
	      })
	    },
          allAssociations : function(request){
              return $.ajax({
                  type : 'POST',
                  data : JSON.stringify(request),
                  dataType : 'json',
                  contentType: 'application/json',
                  url: 'api/allAssociations'
              })
          },
          completeNetwork : function(request){
              return $.ajax({
                  type : 'POST',
                  data : JSON.stringify(request),
                  dataType : 'json',
                  contentType: 'application/json',
                  url: 'api/completeNetwork'
              })
          },

          click : function(request){
              return $.ajax({
                  type : 'POST',
                  data : JSON.stringify(request),
                  dataType : 'json',
                  contentType: 'application/json',
                  url: 'api/click'
              })
          },
          abstract : function(request){
              return $.ajax({
                  type : 'POST',
                  data : JSON.stringify(request),
                  dataType : 'json',
                  contentType: 'application/json',
                  url: 'api/abstract'
              })
          },

	    sampleFile : function(url){
	    	return $.ajax({
	      	dataType : 'json',
	      	url: url
	    	})
	    }

		}
	});
