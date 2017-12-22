var app = angular.module('main',['ngRoute']);

app.config(function($routeProvider, $locationProvider, $qProvider){
    $routeProvider

    .when('/',{
        templateUrl : 'pages/home.html',
        controller : 'homeController'
    })

    .when('/about',{
        templateUrl : 'pages/about.html',
        controller : 'aboutController'
    })

    .when('/game',{
        templateUrl : 'pages/game.html',
        controller : 'gameController'
    });

    $qProvider.errorOnUnhandledRejections(false);
});




