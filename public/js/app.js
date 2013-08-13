'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/articles', {
      templateUrl: 'partials/articles',
      controller: 'IndexCtrl'
    }).
    when('/articles/:id', {
      templateUrl: 'partials/article',
      controller: 'ArticleCtrl'
    }).
    otherwise({
      redirectTo: '/articles'
    });

  $locationProvider.html5Mode(true);
});
