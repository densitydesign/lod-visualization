'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

  .controller('IndexCtrl', function ($scope, $http, $injector, apiService) {

    $scope.query = 'Obama';

    $scope.search = function(){
      apiService.search( { q : $scope.query } )
        .done(function(data){
          $scope.articles = data;
          $scope.$apply();
        })
    }

    $scope.search();

  })

  .controller('ArticleCtrl', function ($scope, $http, $injector, apiService, $routeParams) {

    $scope.articleId = $routeParams.id;

  })