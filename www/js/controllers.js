angular.module('App.controllers')
    .controller('loginCtrl', function ($scope, $state, User) {
        $scope.user={};

        $scope.login = function (form) {
            if(form.$invalid) return;
            User.login($scope.user,function(){
                $scope.$emit('user');
                $state.go('app.browse');
            },function(err){
                if(err&&typeof err!=="string") err=!1;
                err&&$scope.$emit('Alert', {
                    type:'error',
                    msg: err
                });
            });
        };
    })
    .controller('registerCtrl', function ($scope, $state, User) {
        $scope.user={};

        $scope.getAvatar = function (img) {
            var file=img[0];
            if(!file) return;
            if(!/image/.test(file.type)) return;
            if(file.size>716800) return $scope.$emit('Alert', {
                type:'error',
                msg: 'File size too big'
            });
            var reader = new FileReader();
            reader.onload = function () {
                $scope.user.picture = reader.result;
                $scope.$$phase || $scope.$digest()
            };
            reader.readAsDataURL(file);
        };

        $scope.register = function (form) {
            if(form.$invalid) return;
            User.register($scope.user,function(){
                $scope.$emit('Alert', {
                    type:'success',
                    msg: 'Registered Successful'
                });
            },function(err){
                if(err&&typeof err!=="string") err=!1;
                err&&$scope.$emit('Alert', {
                    type:'error',
                    msg: err
                });
            });
        };
    })
    .controller('forgotPasswordCtrl', function ($scope,User) {
        $scope.user={};

        $scope.forgotPassword = function(form){
            if(form.$invalid) return;
            User.forgotPassword($scope.user.email, function(msg){
                $scope.$emit('Alert', {
                    type:'success',
                    msg: msg
                });
            }, function(err){
                if(err&&typeof err!=="string") err=!1;
                err&&$scope.$emit('Alert', {
                    type:'error',
                    msg: err
                });
            })
        };
    })
    .controller('profileCtrl', function ($rootScope, $scope, Product) {
        $scope.update = function () {
            var user = $scope.user;
            Product.updateCustomer({
                id:user.id,
                firstName:user.firstname,
                lastName:user.lastname,
                email:user.email,
                password: user.password&&user.password.length?user.password:undefined
            }, function () {
                $scope.$emit('Alert', {
                    type:'success',
                    msg: 'Profile Updated'
                });
            }, function(err){
                if(err&&typeof err!=="string") err=!1;
                err&&$scope.$emit('Alert', {
                    type:'error',
                    msg: err
                });
            })
        };
    })
    .controller('productsCtrl', function ($scope, $state, $stateParams, Main, Product) {
        var currentPage, pages, orders, orderBy, query={};
        $scope.products=[];

        $scope.toDateFormat = Main.toDateFormat;
        orders={top:'rating',newest:'date',popular:'popularity',price:'price','price-desc':'price-desc'};
        orderBy=$stateParams.orderBy;
        typeof orderBy==='string'&&(orderBy=orderBy.toLocaleLowerCase());
        if(orderBy in orders){
            $scope.titlePrefix=orderBy.charAt(0).toLocaleUpperCase()+orderBy.slice(1).toLocaleLowerCase();
            query.orderBy=orders[orderBy];
        } else $state.back();
        Product.getProducts(query, function (data) {
            currentPage=1;
            pages=data.pages;
            $scope.products=data.products;
            $scope.msg = $scope.products.length?'':'No products found!';
            $scope.$$phase||$scope.$digest();
        }, function (err) {
            if(err&&typeof err!=="string") err=!1;
            err&&$scope.$emit('Alert', {
                type:'error',
                msg: err
            });
        });

        $scope.canLoadMore = function () {
            return $scope.products.length && currentPage<pages;
        };

        $scope.loadMore = function () {
            if(!$scope.canLoadMore()) return;
            Product.getProducts(angular.extend({
                page:currentPage+1,
                loadingIgnore:true
            },query), function (data) {
                ++currentPage;
                $scope.products=$scope.products.concat(data.products);
                $scope.$$phase||$scope.$digest();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function (err) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if(err&&typeof err!=="string") err=!1;
                err&&$scope.$emit('Alert', {
                    type:'error',
                    msg: err
                });
            });
        };
    })
    .controller('playerCtrl', function($scope, Player){
        $scope.play=Player.play.bind(Player, function () {
            $scope.isPlaying=true;
            $scope.$$phase||$scope.$digest();
        });
        $scope.pause=Player.pause.bind(Player, function () {
            $scope.isPlaying=false;
            $scope.$$phase||$scope.$digest();
        });
        Player.timeUpdate(function () {
            $scope.currentTime=Player.currentTimeC;
            $scope.duration=Player.durationC;
            $scope.progress=Player.currentTime/Player.duration*100;
            $scope.$$phase||$scope.$digest();
        });
        $scope.mute=Player.mute;
        $scope.isNext=Player.isNext;
        $scope.isPrevious=Player.isPrevious;
        $scope.next=Player.next;
        $scope.previous=Player.previous;
        $scope.loop = function (v) {
            if(v===undefined) return Player.loop;
            Player.loop=!Player.loop
        };
        $scope.shuffle = function (v) {
            if(v===undefined) return Player.shuffle;
            Player.shuffle=!Player.shuffle;
        };
    })
    .controller('browseCtrl', function ($scope, $state, $stateParams, Product, $ionicSlideBoxDelegate) {
        $scope.sliderItems = [];
        $scope.series = [];
        Product.getProducts({
            limit:4,
            orderBy:'popularity'
        }, function (data) {
            $scope.sliderItems=data.products;
            $scope.$$phase||$scope.$digest();
            $ionicSlideBoxDelegate.update();
        }, function (err) {
            if(err&&typeof err!=="string") err=!1;
            err&&$scope.$emit('Alert', {
                type:'error',
                msg: err
            }, function () {
                $state.back();
            });
        });
        Product.getProducts({
            orderBy:'popularity'
        }, function (data) {
            $scope.series=data.products;
            $scope.$$phase||$scope.$digest();
        }, function (err) {
            if(err&&typeof err!=="string") err=!1;
            err&&$scope.$emit('Alert', {
                type:'error',
                msg: err
            }, function () {
                $state.back();
            });
        })
    })
    .controller('productCtrl', function ($scope, $state, $stateParams, Product) {
        $scope.product = {};
        Product.getProduct({id:$stateParams.id}, function (data) {
            $scope.product=data;
            console.log(data);
            $scope.$$phase||$scope.$digest();
        }, function (err) {
            if(err&&typeof err!=="string") err=!1;
            err&&$scope.$emit('Alert', {
                type:'error',
                msg: err
            }, function () {
                $state.back();
            });
        })
    })
    .controller('searchCtrl', function ($scope, Main, Product, $ionicScrollDelegate) {
        var search, currentPage, pages;
        $scope.products=[];

        $scope.toDateFormat = Main.toDateFormat;

        $scope.submit= function (form) {
            if(form.$invalid) return;
            Product.getProducts({search: search=$scope.search}, function (data) {
                $ionicScrollDelegate.scrollTop();
                currentPage=1;
                pages=data.pages;
                $scope.products=data.products;
                $scope.msg = $scope.products.length?'':'No products found!';
                $scope.$$phase||$scope.$digest();
            }, function (err) {
                if(err&&typeof err!=="string") err=!1;
                err&&$scope.$emit('Alert', {
                    type:'error',
                    msg: err
                });
            });
        };

        $scope.canLoadMore = function () {
          return $scope.products.length && currentPage<pages;
        };
        
        $scope.loadMore = function () {
            if(!$scope.canLoadMore()) return;
            Product.getProducts({
                search:search,
                page:currentPage+1,
                loadingIgnore:true
            }, function (data) {
                ++currentPage;
                $scope.products=$scope.products.concat(data.products);
                $scope.$$phase||$scope.$digest();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function (err) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if(err&&typeof err!=="string") err=!1;
                err&&$scope.$emit('Alert', {
                    type:'error',
                    msg: err
                });
            });
        };
    })
    .controller('mainCtrl', function ($rootScope, $scope, $ionicActionSheet, BASE_URL, $http, $ionicLoading, $ionicPopup, $state, User) {
        $scope.goBack = function() {
            $state.back();
        };
        function getUser(){
            if(!User.getUser()){
                User.getUserInfo(function (user) {
                    $scope.user=user;
                    $scope.user.picture=$scope.user.picture||'img/profile-default.png';
                    $scope.$$phase||$scope.$digest();
                }, function () {
                    $scope.$emit('user',true);
                });
            } else {
                $scope.user=User.getUser();
                $scope.user.picture=$scope.user.picture||'img/profile-default.png';
                $scope.$$phase||$scope.$digest();
            }
        }
        getUser();

        $scope.logout=function () {
            $scope.$emit('user',true);
        };

        $scope.showActionSheet = function() {

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-reply-all rotate"></i> Share', icon:"ion-plus" },
                    { text: '<i class="icon ion-person-add"></i> Follow' },
                    { text: '<i class="icon ion-log-out"></i> Go to Minister\'s Page' }
                ],
                cancelText: 'Cancel',
                cancel: function() {
                    // add cancel code..
                },
                buttonClicked: function(index) {
                    if(index==2) $state.go('app.minister');
                    return true;
                }
            });
        };

        $rootScope.$on('user', function(e, logout){
            if(logout) {
                User.logout();
                $scope.user=!1;
                $state.go('login');
            }
            else getUser();
            $scope.$$phase||$scope.$digest();
        });

        $rootScope.$on('Alert',function(e,opt, cb){
            if(typeof cb!=="function") cb=function(){};
            if(!opt) return;
            var type='positive';
            if(opt.type&&typeof opt.type==="string"){
                if(opt.type.toLowerCase()==='error') {
                    type = 'assertive';
                    opt.title='Error';
                }
                if(opt.type.toLowerCase()==='success') opt.title='Success';
            }
            var error = $ionicPopup.alert({
                title: '<span class="'+type+'">'+(opt.title||'Alert')+'</span>',
                template: opt.msg||'Unknown error.',
                okType: 'button-'+type
            });
            error.then(cb);
        });

        $scope.$watch(function() {
            var p =$http.pendingRequests;
            var r = p.filter(function(r, i) {
                var urls = [];

                return !( (urls.some(function(u) {
                    return r.url === u || r.url === BASE_URL + u
                })) || (r.loadingIgnore) )
            });
            return r.length > 0;
        }, function(v) {
            if (v) $ionicLoading.show({
                template: '<i class="button-icon icon ion-loading-c"></i>'
            });
            else $ionicLoading.hide();
        });
    });