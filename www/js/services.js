angular.module('App.services')
    .service('Main', function () {

        this.toDateFormat=function (d) {
            d = new Date(d);
            return d.toLocaleDateString().replace(/\//g,'.');
        };

        this.getSuccess=function(success,error){
            return function(data){
                if(data.status=='ok') success(data);
                else if(data.status=='error') error(data.error);
                else error("Unknown error");
            }
        };

        this.getError=function(error){
            return function(data, status){
                if(!status) error("Network error");
                else if(status>=500) error('Internal Server error');
            }
        }
    })
    .factory('isLogin', function (User) {
        return User.isLogin;
    })
    .service('Product', function (BASE_URL, Main, $http) {
        var self=this,getSuccess=Main.getSuccess,getError=Main.getError;
        this.search = function (obj, success, error) {
            $http.get(BASE_URL+'/api/get_posts',{
                params:{
                    post_type:'download',
                    s: obj.search,
                    page:obj.page,
                    loadingIgnore: obj.loadingIgnore
                }
            }).success(getSuccess(success,error)).error(getError(error));
        };
    })
    .service('User', function (BASE_URL, Main, $http) {
        var self=this,Func=function(){},getSuccess=Main.getSuccess,getError=Main.getError;

        this.isEmail=function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };

        function setToken(token){
            if(typeof token==="string")
                localStorage.token=token;
        }

        function getToken(){
            return localStorage.token;
        }

        this.setUser=function(user){
            self.user=user
        };

        this.getUser=function(){
            return self.user
        };

        this.isLogin = function () {
            return !!localStorage.token;
        };

        this.logout = function () {
            delete localStorage.token;
        };

        function getNonce(method, success, error){
            method=typeof method==="string"?method:"";
            success=typeof success==="function"?success:Func;
            error=typeof error==="function"?error:Func;
            $http.get(BASE_URL+"/api/get_nonce/", {
                params: {
                    controller: 'user',
                    method: method
                }
            }).success(getSuccess(function(data){
                success(data.nonce);
            },error)).error(getError(error));
        }

        this.register=function (user, success, error){
            success=typeof success==="function"?success:Func;
            error=typeof error==="function"?error:Func;
            getNonce('register', function (nonce) {
                $http.post(BASE_URL+"/api/user/register/",{
                    picture: user.picture
                }, {
                    params: {
                        username: user.username,
                        email: user.email,
                        user_pass: user.password,
                        nonce: nonce,
                        display_name: user.username
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(getSuccess(function(data){
                    success();
                },error)).error(getError(error));
            },error);
        };

        this.login=function (user, success, error){
            success=typeof success==="function"?success:Func;
            error=typeof error==="function"?error:Func;
            getNonce('generate_auth_cookie', function (nonce) {
                $http.get(BASE_URL+"/api/user/generate_auth_cookie/", {
                    params: {
                        username: user.username,
                        password: user.password,
                        nonce: nonce
                    }
                }).success(getSuccess(function(data){
                    setToken(data.cookie);
                    self.setUser(data.user);
                    success(data.user)
                },error)).error(getError(error));
            },error);
        };

        this.fbConnect=function (token, success, error){
            success=typeof success==="function"?success:Func;
            error=typeof error==="function"?error:Func;
            $http.get(BASE_URL+"/api/user/fb_connect/", {
                params: {
                    access_token: token
                }
            }).success(getSuccess(function(data){
                setToken(data.cookie);
                self.getUserInfo(function (user) {
                    success(user);
                },error);
            },error)).error(getError(error));
        };

        this.getUserInfo=function (success, error){
            if(!getToken()) return;
            success=typeof success==="function"?success:Func;
            error=typeof error==="function"?error:Func;
            $http.get(BASE_URL+"/api/user/get_currentuserinfo/", {
                params: {
                    cookie: getToken()
                }
            }).success(getSuccess(function(data){
                self.setUser(data.user);
                success(data.user);
            },error)).error(getError(error));
        };

        this.validateToken=function (success, error){
            success=typeof success==="function"?success:Func;
            error=typeof error==="function"?error:Func;
            $http.get(BASE_URL+"/api/user/validate_auth_cookie/", {
                params: {
                    cookie: getToken()
                }
            }).success(getSuccess(function(data){
                success(data.valid);
            },error)).error(getError(error));
        };

        this.forgotPassword=function (user, success, error){
            if(typeof user!=="string") return;
            success=typeof success==="function"?success:Func;
            error=typeof error==="function"?error:Func;
            $http.get(BASE_URL+"/api/user/retrieve_password/", {
                params: {
                    user_login: user
                }
            }).success(getSuccess(function(data){
                success(data.msg);
            },error)).error(getError(error));
        };
    })
;