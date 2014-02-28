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
      })

  })

  .controller('ArticleCtrl', function ($scope, $http, $injector, apiService, $routeParams) {

    $scope.articleId = $routeParams.id;
    $scope.openGraph = false;
    $scope.degree = 2;

    $scope.graphRequest = {};

    apiService.article( { id : $scope.articleId })
      .done(function (data){
        $scope.article = data;
        $scope.$apply();
      })

    $scope.createGraph = function(target){
      if (!target) return;
      $scope.graphRequest = {
        article : $scope.articleId,
        degree : $scope.degree
      }

      $scope.graphRequest.target = target;
      $scope.graphRequest.source = $scope.article.mainInstances.filter(function(i){ return i.isPrimary; })[0].instance.id;

      apiService.graph($scope.graphRequest)
      .done(function (data){
        $scope.graph = data;
        $scope.openGraph = true;
        $scope.$apply();
      })
    } 

    $scope.$watch('degree', function(){ $scope.createGraph($scope.graphRequest.target); })

  })

  .controller('SampleCtrl', function ($scope, $http, $injector, apiService, $routeParams) {

    $scope.articleId = $routeParams.id;
    $scope.openGraph = false;
    $scope.degree = 2;

    $scope.graphRequest = {};

    apiService.sampleFile('../data/article.json')
      .done(function (data){
        $scope.article = data;
        $scope.$apply();
      })

    $scope.createGraph = function(target){
      if (!target) return;
      $scope.graphRequest = {
        article : $scope.articleId,
        degree : $scope.degree
      }

      $scope.graphRequest.target = target;
      $scope.graphRequest.source = $scope.article.mainInstances.filter(function(i){ return i.isPrimary; })[0].instance.id;

      apiService.sampleFile('data/graph.json')
      .done(function (data){
        $scope.graph = data;
        $scope.openGraph = true;
        $scope.$apply();
      })
    } 

    $scope.$watch('degree', function(){ $scope.createGraph($scope.graphRequest.target); })

  })