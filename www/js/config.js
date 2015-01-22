!function (angular) {
    angular.module('config', ['ui.router'])
        .provider('Config',['$locationProvider', '$stateProvider', function ($locationProvider,$stateProvider) {
            var isLogin, providerObj, appName, showTitle=!0, showSubTitle=!0, titlePrefix=' - ', authState, unAuthState, errorPage,
                getFunc = ['$state',function (isLoginFac,$state) {
                    if(!$state){
                        $state=isLoginFac;
                        isLoginFac=undefined;
                    }
                    if(typeof isLoginFac !== "undefined") {
                        if (!isFunction(isLoginFac))
                            error(typeof isLoginFac + 'function');
                        else isLogin = isLoginFac;
                    }
                    var getObj = {
                        loginService: function (name){
                            if(isFunction(name)) isLogin=name;
                            return getObj;
                        },
                        isLogin: function () {
                            return isLogin();
                        },
                        appName: function () {
                            return appName || ""
                        },
                        showTitle: function () {
                            return showTitle
                        },
                        showSubTitle: function () {
                            return showSubTitle
                        },
                        titlePrefix: function () {
                            return titlePrefix
                        },
                        isAuth : function () {
                            return !!(isLogin && authState && unAuthState);
                        },
                        authState: function () {
                            return authState;
                        },
                        unAuthState: function () {
                            return unAuthState;
                        },
                        removeState: function () {
                            unAuthState=authState=!1;
                        }
                    };
                    function isValidState(state,auth){
                        var v,s=$state.get(state);
                        if(s===null){
                            error(getObj.state(),'valid state');
                            return;
                        }
                        v=(s.authenticate===false&&auth)||(s.authenticate===true&&!auth);
                        if(v) error("authenticate property of "+auth?"Auth":"unAuth"+" state should not "+s.authenticate);
                        return v
                    }
                    if(getObj.isAuth()) {
                        if(isValidState(getObj.authState(),true)||isValidState(getObj.unAuthState()))
                            getObj.removeState();
                    }
                return getObj
            }];
            function isFunction(func){
                return typeof func === "function"
            }
            function isObject(obj){
                return typeof obj === "object"
            }
            function isString(str){
                return typeof str === "string"
            }
            function isBoolean(bool){
                return typeof bool === "boolean"
            }
            function error(a,b){
                b=b?' is not a '+b:'';
                console.error('ConfigProvider: '+a+b)
            }

            function changeTemplateURL(url){
                var reg = /^\/\//, reg2 = /^[\/]+|/;
                if($locationProvider.html5Mode().enable && !reg.test(url))
                    return url.replace(reg2,'/');
                else if(!$locationProvider.html5Mode().enable && !reg.test(url))
                    return url.replace(reg2,'');
            }

            $stateProvider.decorator('HTMLModeHandler', function (state) {
                if(!state.templateUrl){
                    if(!state.views) return;
                    angular.forEach(state.views, function(val){
                        if(isObject(val)){
                            val.templateUrl=changeTemplateURL(val.templateUrl);
                        }
                    })
                } else state.templateUrl=changeTemplateURL(state.templateUrl);
            });
            providerObj = {
                authState: function (State) {
                    if (isString(State)&&State) authState = State;
                    else error(typeof State,'state');
                    return providerObj;
                },
                unAuthState: function (State) {
                    if (isString(State)&&State) unAuthState = State;
                    else error(typeof State,'state');
                    return providerObj;
                },
                loginService: function (name){
                    if(isFunction(name)) isLogin=name;
                    if(isString(name)&&getFunc.length === 2) getFunc.unshift(name);
                    if(isString(name)&&getFunc.length === 3) getFunc[0]=name;
                    return providerObj;
                },
                appName: function (name) {
                    if(isString(name)&&name) appName=name;
                    return providerObj;
                },
                showTitle: function (mode) {
                    if(isBoolean(mode)&&mode) showTitle=mode;
                    return providerObj;
                },
                showSubTitle: function (mode) {
                    if(isBoolean(mode)&&mode) showSubTitle=mode;
                    return providerObj;
                },
                titlePrefix: function (prefix) {
                    if(isString(prefix)&&prefix) titlePrefix=prefix;
                    return providerObj;
                },
                errorPage: function(mode){
                    if(isBoolean(mode)&&mode){
                        errorPage = mode;
                        $stateProvider.state('error', {
                            url: '/{error:\.+}',
                            templateUrl: "partials/404.html",
                            title: "404",
                            desc: "Error occurred! - Page not Found",
                            pageTitle: true
                        });
                        return providerObj;
                    } else {
                        return !!errorPage;
                    }
                },
                $get: getFunc
            };
            return providerObj
        }])
        .run(['$rootScope', '$state', 'Config', function ($rootScope, $state, Config) {
            $state.back = function () {
                if ($state.previous) $state.go($state.previous);
            };

            /* Set AppName */
            if(Config.appName())
                $rootScope.appName = Config.appName();

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
                $state.previous = fromState.name;

                /* Get Title */
                if (toState.title) $rootScope.title = toState.title;
                /* Get Description */
                if (toState.desc) $rootScope.desc = toState.desc;
                /* Set browser Title */
                document.title = '';
                if (Config.showSubTitle() && typeof toState.title === 'string' && toState.title && toState.pageTitle) {
                    document.title = toState.title;
                }
                if (Config.showTitle() && Config.appName()) {
                    document.title += (document.title ? Config.titlePrefix() : '') + Config.appName();
                }

                /* Authenticate */
                if (Config.isAuth()) {
                    if (toState.authenticate === false && Config.isLogin()) {
                        event.preventDefault();
                        if (!fromState.name) $state.go(Config.authState());
                    } else if (toState.authenticate === true && !Config.isLogin()) {
                        event.preventDefault();
                        if (!fromState.name) $state.go(Config.unAuthState());
                    }
                }
            });
        }]);
}(angular);