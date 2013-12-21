'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

  .controller('MainCtrl', function ($scope, $http) {

    $scope.title = "DaCena";
    $scope.prev = null;
    $scope.next = null;

  })

  .controller('IndexCtrl', function ($scope, $http, $injector, apiService) {

    /*$scope.query = 'Obama';

    $scope.search = function(){
      apiService.search( { q : $scope.query } )
        .done(function(data){
          $scope.articles = data;
          $scope.$apply();
        })
    }*/

    apiService.articles({})
      .done(function(data){
        $scope.articles = data;
        $scope.$apply();
        console.log(data);
      })

  })

  .controller('ArticleCtrl', function ($scope, $http, $injector, apiService, $routeParams) {

    $scope.articleId = $routeParams.id;

    apiService.article({id:$scope.articleId})
      .done(function(data){
        $scope.article = data;
        $scope.$apply();
        console.log(data)
      })

    var graph = {
      article : $scope.articleId,
      degree : 1
    }

    $scope.createGraph = function(target){
      graph.target = target;
      graph.source = $scope.article.mainInstances.filter(function(i){ return i.isPrimary; })[0].instance.id;

      apiService.graph(graph)
      .done(function(data){
        $scope.graph = data;
        $scope.$apply();
      })
    }  

  })