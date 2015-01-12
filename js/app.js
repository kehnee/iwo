angular.module('App', ['ionic', 'App.controllers', 'App.services'])

    .run(function ($ionicPlatform, $rootScope, $state) {
        $state.back = function () {
            $state.go($state.previous||"app.browse")
        };
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $state.previous = fromState.name;
        });
            $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: '../templates/login.html',
                controller: 'loginCtrl'
            })

            .state('register', {
                url: '/register',
                templateUrl: '../templates/register.html',
                controller: 'registerCtrl'
            })

            .state('app', {
                abstract: true,
                templateUrl: "../templates/menu.html",
                controller: 'mainCtrl'
            })

            .state('app.search', {
                url: "/search",
                views: {
                    'menuContent': {
                        templateUrl: "../templates/search.html"
                    }
                }
            })

            .state('app.browse', {
                url: "/browse",
                views: {
                    'menuContent': {
                        templateUrl: "../templates/browse.html"
                    }
                }
            })
            .state('app.singleProductView', {
                url: "/singleProductView",
                views: {
                    'menuContent': {
                        templateUrl: "../templates/singleProductView.html"
                    }
                }
            })
            .state('app.seriesProductView', {
                url: "/seriesProductView",
                views: {
                    'menuContent': {
                        templateUrl: "../templates/seriesProductView.html"
                    }
                }
            })
        ;
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });
angular.module('App.controllers', []);
angular.module('App.services', []);