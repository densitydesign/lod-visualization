'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

  .controller('MainCtrl', function ($scope, $http) {

      jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    e.dispatchEvent(evt);
  });
};

    $scope.title = "DaCena";
    $scope.prev = null;
    $scope.next = null;
  })

  .controller('IndexCtrl', function ($scope, $http, $injector, apiService) {


        console.log("ad!!");

    apiService.articles({})
      .done(function(data){
        $scope.articles = data;
            console.log(data);
        $scope.$apply();
      })

  })

  .controller('ArticleCtrl', function ($scope, $http, $injector, apiService, $routeParams) {

    $scope.articleId = $routeParams.id;
    $scope.openGraph = false;
    $scope.degree = 2;
    $scope.relevance = 0.5;
    $scope.rarity = 0.5;
    $scope.cut = 100;
    $scope.serendipity = 50;

        $scope.checkModel = {
            one: true,
            two: true,
            three: true
        };

        $scope.pathslen = [1,2,3];


    $scope.highlighted = null;

    $scope.graphRequest = {};

    $(".article-conteiner").height($(window).height());

    apiService.article( { id : $scope.articleId })
      .done(function (data){
        $scope.article = data;
        $scope.$apply();
      })

        $scope.dirLeft = function(t) {
            if(t.substr(0,1)==="L") return true;
            else return false;
        }



        $scope.allAssociations = function() {
            var req = {id:$scope.articleId};
            apiService.allAssociations(req)
                .done(function (data) {
                    $scope.terms=data;
                    $scope.$apply();

                })
        }

        $scope.getAssociations = function() {

            $scope.rarity = 0;
            $scope.relevance = 1;
            $scope.top=10;
            $scope.all=true;

            $scope.assocReq = {
                rarity:$scope.rarity,
                relevance:$scope.relevance,
                top:$scope.top,
                all:$scope.all,
                id:$scope.articleId
            };

            console.log($scope.assocReq);
            apiService.associations($scope.assocReq)
                .done(function (data) {

                })
        }


        $scope.getNetwork = function() {

            $scope.rarity = 0;
            $scope.relevance = 1;
            $scope.top=10;
            $scope.all=true;

            $scope.netReq = {
                id:$scope.articleId
            };

            apiService.completeNetwork($scope.netReq)
                .done(function (data) {
                    
                })
        }


        $(".article-content").on("click",".ui-match",function(){
            $scope.highlighted = $(this).attr("data-id").replace(/ /g,"_");
            $scope.$apply();

            var netreq = {
                action:'text',
                article : $routeParams.id
            }

            apiService.click(netreq).done(function () {
                console.log("done click report")
            });
        })

        $scope.$watch("highlighted", function(newValue,oldValue) {

            if(newValue!== oldValue) {
              d3.selectAll(".highlight").classed("highlight", false);
              //console.log("here",newValue);

                      $('.ui-match').filter(function() {
                          
                            return $(this).attr('data-id').toLowerCase() == newValue.replace(/_/g," ").toLowerCase();
                        }).addClass("highlight");


                if ($scope.selected !== newValue) {
                    $scope.selected = newValue
                    if(newValue !== null) {

                        var el = d3.select("svg").selectAll("circle").filter(function(d){

                            return d.id.toLowerCase() === newValue.toLowerCase()
                        })
                        $("svg").d3Click();
                        $(el[0]).d3Click();
                    }
                }
            }
        })

        $scope.$watch("selected", function(newValue,oldValue) {

            if(newValue!== oldValue) {
                if ($scope.highlighted !== newValue) {
                    $scope.highlighted = newValue
                }
            }
        })


    $scope.$watch("serendipity",_.debounce(function(newValue,oldValue){
      
      if (newValue!=oldValue) {
        var toOne = newValue/100;
        $scope.relevance = toOne;
        $scope.rarity = 1-toOne;

       /* var cut = $scope.cut == 0 ? 100 : $scope.cut;
        //call api
        var netreq = {
          id:$scope.articleId,
          relevance : $scope.relevance,
          rarity : $scope.rarity,
          top : cut
        }

        apiService.associations(netreq).done(function (data) {
           //$("svg").d3Click();
          $scope.drawNet(data);

        });*/

          $scope.callAssociations();

      }
    },500))


    $scope.complete = function() {
       var netreq = {
          id:$scope.articleId
        }

        apiService.completeNetwork(netreq)
          .done(function (data) {
              $("svg").d3Click();
                $scope.drawNet(data);
        })
    }

      $scope.$watch("cut",function(newValue,oldValue){
      
      if (newValue!=oldValue && newValue !== null && newValue <1) {
          $scope.cut = 1;
      }
          else {
          $scope.callAssociations();
      }

    })


        $scope.callAssociations = function() {


            var netreq = {
                id:$scope.articleId,
                relevance : $scope.relevance,
                rarity : $scope.rarity,
                top : $scope.cut,
                paths : $scope.pathslen
            }

            apiService.associations(netreq).done(function (data) {
                //$("svg").d3Click();
                $scope.drawNet(data);
            });
        }

        $scope.$watch("checkModel",function(newValue,oldValue){

            var in1 = $scope.pathslen.indexOf(1);
            var in2 = $scope.pathslen.indexOf(2);
            var in3 = $scope.pathslen.indexOf(3);


            if(newValue.one)
            {
                if(in1<0)  $scope.pathslen.push(1);
            }
            else {
                if(in1>=0)  $scope.pathslen.splice(in1,1);
            }

            if(newValue.two)
            {
                if(in2<0)  $scope.pathslen.push(2);
            }
            else {
                if(in2>=0)   $scope.pathslen.splice(in2,1);
            }

            if(newValue.three)
            {
                if(in3<0)  $scope.pathslen.push(3);
            }
            else {
                if(in3>=0) $scope.pathslen.splice(in3,1);
            }

            $scope.callAssociations();

        },true)


  })

