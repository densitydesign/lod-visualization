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

        function uniq(value, index, self) {
            return self.indexOf(value) === index;
        }
        $scope.filter = "All";

        $scope.filterArts= function(cat){

            $scope.filter=cat;
            if(cat!=="All") {
                $scope.filtered = $scope.articles.filter(function(d){return d.category === cat});
            }
            else $scope.filtered = $scope.articles;


        }

        $scope.status = {
            isopen: false
        };


        $scope.toggleDropdown = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };


        apiService.articles({})
      .done(function(data){
        $scope.articles = data;
        $scope.filtered = $scope.articles;
        $scope.cats = $scope.articles.map(function(d){return d.category}).filter(uniq);
        $scope.cats.push("All");
        $scope.$apply();
      })

  })



  .controller('ArticleCtrl', function ($rootScope,$scope, $http, $injector, $cookieStore,apiService, $routeParams) {

    $scope.loading = true;
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

        $scope.startJoyRide=$cookieStore.get('walkthrough') ? false : true;

        $scope.highlightFirst= function() {
            $("circle[entity]").first().d3Click();
        }
        $scope.unhighlight= function() {
            $("svg").d3Click();
        }


        $scope.config = [
            {
                type: "title",
                heading: "Welcome to our interface!",
                text: 'This walkthrough will help you use the application'

            },{
                type: "element",
                selector: ".article-content",
                heading: "Original article",
                text: "Here you can see the article we took and analysed from the New York Times. ",
                placement: "right",
                scroll: true
            },{
                type: "element",
                selector: ".main-topic",
                heading: "Main topic",
                text: "This is the main \"topic\" of the article.Starting from this topic we got all the correlations in the english DBpedia between it and the other topics (highlighted in yellow below) in the article. ",
                placement: "right",
                scroll: true
            }
            ,{
                type: "element",
                selector: ".paths",
                heading: "Topics network",
                text: "Here you can see all the correlations between the main topic (the big yellow node) and all the other topics that we found and analysed in the article (the other yellow nodes).The grey nodes are the topics on DBpedia that link them but that are not in the article.",
                placement: "left",
                scroll: true
            },{
                type: "element",
                selector: ".ctrl-s",
                heading: "Serendipity",
                text: "we try to show only the most serendipitous correlations, meaning the ones that are more relevant to the article and more unexpected based on the data semantics. You can determine how to weight the relevance and unexpectedness criteria by moving the slider",
                placement: "bottom",
                scroll: true
            },{
                type: "element",
                selector: ".ctrl-t",
                heading: "Links threshold",
                text: "You can determine the number of correlations to visualize",
                placement: "bottom",
                scroll: true
            },{
                type: "element",
                selector: ".ctrl-l",
                heading: "Filter by length",
                text: "you can choose to visualize and filter out correlations based on the length, computed as the number of arcs",
                placement: "bottom",
                scroll: true
            },
            {
                type: "function",
                fn:'highlightFirst' //(can also be a string, which will be evaluated on the scope)
            },{
                type: "element",
                selector: ".col-md-9.paths",
                heading: "Topic insight",
                text: "If you click on a yellow node you can see the path between it and the main topic.",
                placement: "left",
                scroll: true
            }, {
                type: "function",
                fn:'unhighlight' //(can also be a string, which will be evaluated on the scope)
            },{
                type: "element",
                selector: ".info",
                heading: "Show help",
                text: "To see this walkthrough again, click on the help button.",
                placement: "bottom",
                scroll: true
            }
        ];
    $scope.onFinish = function() {
        $cookieStore.put("walkthrough",true);
    }


    $scope.highlighted = null;

    $scope.graphRequest = {};

    $(".article-conteiner").height($(window).height());

    apiService.article( { id : $scope.articleId })
      .done(function (data){
        $scope.article = data;
        $scope.loading = false;
            $scope.$apply();

      })

        $scope.dirLeft = function(t) {
            if(t.substr(0,1)==="L") return true;
            else return false;
        }



        $scope.allAssociations = function() {
            $scope.loading  = true;
            var req = {id:$scope.articleId};
            apiService.allAssociations(req)
                .done(function (data) {
                    $scope.terms=data;
                    $scope.$apply();
                    $scope.loading=false;

                })
        }

  /*      $scope.getAssociations = function() {

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

            apiService.associations($scope.assocReq)
                .done(function (data) {

                })
        }
*/

  /*      $scope.getNetwork = function() {

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

*/
        $(".article-content").on("click",".ui-match",function(){
            $scope.highlighted = $(this).attr("data-id").replace(/ /g,"_");
            $scope.$apply();

            var netreq = {
                action:'text',
                article : $routeParams.id
            }

            apiService.click(netreq).done(function () {
            });
        })

        $scope.$watch("highlighted", function(newValue,oldValue) {

            if(newValue!== oldValue && newValue) {
              d3.selectAll(".highlight").classed("highlight", false);


                      $('.ui-match').filter(function() {
                            return $(this).attr('data-id').toLowerCase() == newValue.replace(/_/g," ").toLowerCase();
                        }).addClass("highlight");


                if ($scope.selected !== newValue) {
                    $scope.selected = newValue;
                    if(newValue !== null) {

                        var el = d3.select("svg").selectAll("circle").filter(function(d){

                            return d.id.toLowerCase() === newValue.toLowerCase()
                        })
                        $("svg").d3Click();
                        $(el[0]).d3Click();
                    }
                }
            }

            if(!newValue) {
                $scope.selected = newValue;
                d3.selectAll(".highlight").classed("highlight", false);
            }

        })

        $scope.$watch("selected", function(newValue,oldValue) {

            if(newValue!== oldValue) {

                $scope.names={};

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

          $scope.callAssociations();

      }
    },500))


    $scope.complete = function() {
        $scope.loading = true;
       var netreq = {
          id:$scope.articleId
        }

        apiService.completeNetwork(netreq)
          .done(function (data) {
              $("svg").d3Click();
                $scope.drawNet(data);
                $scope.loading = false;
                $scope.$apply();
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


        $scope.closePopup = function() {
            $rootScope.open = false;
            $(".artooltip").hide();
            $(".artooltip span").html('<i class="fa fa-spinner fa-pulse"></i>');
        }



        $scope.callAssociations = function() {

            $scope.loading = true;
            if(!$scope.article || $scope.cut<1 || $scope.cut>$scope.article.num_of_associations || $scope.cut == null || !$scope.cut) {
                return null
            }

            else {

                var netreq = {
                    id: $scope.articleId,
                    relevance: $scope.relevance,
                    rarity: $scope.rarity,
                    top: $scope.cut,
                    paths: $scope.pathslen
                }

                apiService.associations(netreq).done(function (data) {
                    //$("svg").d3Click();
                    $scope.drawNet(data);
                    $scope.loading = false;
                    $scope.$apply();
                })


            }
        };

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

