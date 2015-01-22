'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'ngSanitize',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'ui.utils'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/articles', {
      templateUrl: 'partials/articles_new',
      controller: 'IndexCtrl'
    }).
      when('/about', {
        templateUrl: 'partials/about'
      }).
    when('/article/:id', {
      templateUrl: 'partials/article_new',
      controller: 'ArticleCtrl'
    }).
    otherwise({
      redirectTo: '/articles'
    });

  $locationProvider.html5Mode(true);
});
