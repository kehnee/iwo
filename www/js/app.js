angular.module('App', ['ionic', 'config', 'App.controllers', 'App.services'])
    .config(function ($stateProvider, $urlRouterProvider, ConfigProvider, $httpProvider) {
        ConfigProvider
            .authState('app.browse')
            .unAuthState('login')
            .loginService('isLogin');
        $httpProvider.defaults.headers.common['Content-Type']='application/json';

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'loginCtrl',
                authenticate: false
            })
            .state('register', {
                url: '/register',
                templateUrl: 'templates/register.html',
                controller: 'registerCtrl',
                authenticate: false
            })
            .state('forgotPassword', {
                url: '/forgotPassword',
                templateUrl: 'templates/forgotPassword.html',
                controller: 'forgotPasswordCtrl',
                authenticate: false
            })
            .state('app', {
                abstract: true,
                templateUrl: "templates/menu.html"
            })
            .state('app.search', {
                url: "/search",
                views: {
                    'menuContent': {
                        controller:'searchCtrl',
                        templateUrl: "templates/search.html"
                    }
                },
                authenticate: true
            })
            .state('app.browse', {
                url: "/browse",
                views: {
                    'menuContent': {
                        controller:'browseCtrl',
                        templateUrl: "templates/browse.html"
                    }
                },
                authenticate: true
            })
            .state('app.minister', {
                url: "/minister/{name}",
                views: {
                    'menuContent': {
                        controller: "ministerCtrl",
                        templateUrl: "templates/minister.html"
                    }
                },
                authenticate: true
            })
            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent': {
                        controller: "profileCtrl",
                        templateUrl: "templates/profile.html"
                    }
                },
                authenticate: true
            })
            .state('app.purchase', {
                url: "/purchase",
                views: {
                    'menuContent': {
                        templateUrl: "templates/purchase.html"
                    }
                },
                authenticate: true
            })
            .state('app.product', {
                url: "/product/{id:int}",
                views: {
                    'menuContent': {
                        controller: 'productCtrl',
                        templateUrl: "templates/product.html"
                    }
                },
                authenticate: true
            })
            .state('app.products', {
                url: "/products/{filter}",
                views: {
                    'menuContent': {
                        controller: 'productsCtrl',
                        templateUrl: "templates/products.html"
                    }
                },
                authenticate: true
            })
            .state('app.singleProductView', {
                url: "/singleProductView",
                views: {
                    'menuContent': {
                        templateUrl: "templates/singleProductView.html"
                    }
                },
                authenticate: true
            })
            .state('app.seriesProductView', {
                url: "/seriesProductView",
                views: {
                    'menuContent': {
                        templateUrl: "templates/seriesProductView.html"
                    }
                },
                authenticate: true
            })
            .state('app.player', {
                url: "/player",
                views: {
                    'menuContent': {
                        controller: "playerCtrl",
                        templateUrl: "templates/player.html"
                    }
                },
                authenticate: true
            })
        ;
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/browse');
    })
    .constant('BASE_URL','http://iworshiponline.com')
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
    .directive('autoScroll', function(){
        return function(scope, elm){
            !function(elm){
                var fn=arguments.callee, e=elm[0], width= e.scrollWidth, s=60;
                width=width-e.offsetWidth;
                s=width/s;
                elm.css({
                    'transition-duration': s+'s',
                    'margin-left': -width+'px'
                });
                setTimeout(function () {
                    elm.css({
                        'transition-duration': '0s',
                        'margin-left': '0px'
                    });
                },s*1000);
                setTimeout(function () {
                    fn(elm)
                },s*1000+100);
            }(elm);
        }
    })
;
angular.module('App.controllers', []);
angular.module('App.services', []);