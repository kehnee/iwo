angular.module('App.services')
    .service('Main', function (BASE_URL,$http) {
        var self=this, Func=function(){};
        this.toDateFormat=function (d) {
            d = new Date(d);
            return d.toLocaleDateString().replace(/\//g,'.');
        };

        this.request = function (method,url,obj,success,error) {
            typeof success!=="function"&&(success=Func);
            typeof error!=="function"&&(error=Func);
            /^\w/.test(url)&&(url='/'+url);
            $http(angular.extend(obj,{
                url:BASE_URL+url,
                method:method
            })).success(success).error(self.getError(error));
        };

        this.getError=function(error){
            return function(data, status){
                if(!status) error("Network error");
                else if(data.errors&&data.errors[0]&&data.errors[0].message){
                    error(data.errors[0].message)
                }
                else if(status>=500) error('Internal Server error');
            }
        };
    })
    .factory('isLogin', function (User) {
        return User.isLogin;
    })
    .service('Product', function (Main) {
        var self=this, secret={
            consumer_key:'ck_121016531148288cd09b8641caddb18f',
            consumer_secret:'cs_47f734163800198713d76632c3258ff1'
        };
        this.getCustomer = function (obj, success, error) {
            if(!Number(obj.id)) return error("Id is invalid");
            Main.request("get","/wc-api/v2/customers/"+obj.id, {
                params: angular.extend({}, secret),
                loadingIgnore: obj.loadingIgnore
            }, function (data) {
                data.customer&&success&&success(data.customer);
            }, error);
        };
        window.a=this.updateCustomer = function (obj, success, error) {
            if(!Number(obj.id)) return error("Id is invalid");
            var config={
                params: angular.extend({}, secret),
                data: {
                    customer:{
                        first_name: obj.firstName,
                        last_name: obj.lastName,
                        email: obj.email,
                        picture: obj.picture,
                        password: obj.password
                    }
                },
                loadingIgnore: obj.loadingIgnore
            };
            Main.request("put","/wc-api/v2/customers/"+obj.id, config, function (data) {
                data.customer&&success&&success(data.customer);
            }, error);
        };
        this.getCustomerOrders = function (obj, success, error) {
            if(!Number(obj.id)) return error("Id is invalid");
            Main.request("get","/wc-api/v2/customers/"+obj.id+"/orders", {
                params: angular.extend({}, secret),
                loadingIgnore: obj.loadingIgnore
            }, function (data) {
                data.orders&&success&&success(data.orders);
            }, error);
        };
        this.getCustomerDownloads = function (obj, success, error) {
            if(!Number(obj.id)) return error("Id is invalid");
            Main.request("get","/wc-api/v2/customers/"+obj.id+"/downloads", {
                params: angular.extend({}, secret),
                loadingIgnore: obj.loadingIgnore
            }, function (data) {
                data.downloads&&success&&success(data.downloads);
            }, error);
        };
        function Order(obj, success, error, update) {
            if(update&&!Number(obj.id)) return error("Id is invalid");
            if(!Number(obj.customerId)) return error("customerId is invalid");
            if(obj.items&&angular.isArray(obj.items)){
                obj.items=obj.items.map(function (v) {
                    if(angular.isString(v)){
                        return {
                            product_id:v,
                            quantity:1
                        }
                    }
                });
            } else obj.items=undefined;
            Main.request(update?"put":"post","/wc-api/v2/orders/"+(update?obj.id:''), {
                params: angular.extend({}, secret),
                data: {
                    order:{
                        payment_details:{
                            "method_id": "bacs",
                            "method_title": "Direct Bank Transfer",
                            "paid": true
                        },
                        customer_id: obj.customerId,
                        line_items: obj.items
                    }
                },
                loadingIgnore: obj.loadingIgnore
            }, function (data) {
                data.order&&success&&success(data.order);
            }, error);
        }
        this.createOrder= function (obj, success, error) {
            return Order(obj, success, error);
        };
        this.updateOrder= function (obj, success, error) {
            return Order(obj, success, error, true);
        };
        this.deleteOrder = function (obj, success, error) {
            if(!Number(obj.id)) return error("Id is invalid");
            Main.request("delete","/wc-api/v2/orders/"+obj.id, {
                params: angular.extend({
                    force:true
                }, secret),
                loadingIgnore: obj.loadingIgnore
            }, function (data) {
                data.message&&success&&success(data.message);
            }, error);
        };
        this.getOrder = function (obj, success, error) {
            if(!Number(obj.id)) return error("Id is invalid");
            Main.request("get","/wc-api/v2/orders/"+obj.id, {
                params: angular.extend({}, secret),
                loadingIgnore: obj.loadingIgnore
            }, function (data) {
                data.order&&success&&success(data.order);
            }, error);
        };
        this.getProducts = function (obj, success, error) {
            Main.request("get","/wc-api/v2/products", {
                params: angular.extend({
                    'filter[q]': obj.search,
                    'filter[limit]': obj.limit,
                    'filter[category]':obj.category,
                    page:obj.page,
                    type: 'simple',
                    orderby: obj.orderBy /* popularity,rating,date(newest),price(low to high),price-desc(high to low) */
                }, secret),
                loadingIgnore: obj.loadingIgnore
            }, function (data) {
                data.products=data.products.filter(function(o){
                    return o.downloadable;
                });
                data.products&&success&&success(data);
            }, error);
        };
        this.getProduct = function (obj, success, error) {
            if(!Number(obj.id)) return error("Id is invalid");
            Main.request("get","/wc-api/v2/products/"+obj.id, {
                params: angular.extend({}, secret),
                loadingIgnore: obj.loadingIgnore
            }, function(data){
                if(data.product) success(data.product);
                else if(data.error) error(data.error);
            }, error);
        };
        this.getCategories = function (obj, success, error) {
            Main.request("get","/wc-api/v2/products/categories", {
                params: angular.extend({}, secret),
                loadingIgnore: obj.loadingIgnore
            }, function (data) {
                data.product_categories&&success&&success(data.product_categories);
            }, error);
        };
    })
    .service('User', function (Main, Product) {
        var self=this,
            getSuccess=function(success,error) {
                return function (data) {
                    if (data.status == 'ok') success(data);
                    else if (data.status == 'error') error(data.error);
                    else error("Unknown error");
                }
            };

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
            Main.request("get","/api/get_nonce/", {
                params: {
                    controller: 'user',
                    method: method
                }
            },getSuccess(function(data){
                success(data.nonce);
            },error), error);
        }

        this.register=function (user, success, error){
            getNonce('register', function (nonce) {
                Main.request("post","/api/user/register/", {
                    params: {
                        username: user.username,
                        email: user.email,
                        user_pass: user.password,
                        nonce: nonce,
                        display_name: user.username
                    }
                },getSuccess(function(data){
                    Product.updateCustomer({
                        id:data.user_id,
                        picture:user.picture
                    }, function (data) {
                        success();
                    }, error);
                },error),error);
            },error);
        };

        this.login=function (user, success, error){
            getNonce('generate_auth_cookie', function (nonce) {
                Main.request("get","/api/user/generate_auth_cookie/", {
                    params: {
                        username: user.username,
                        password: user.password,
                        nonce: nonce
                    }
                },getSuccess(function(data){
                    setToken(data.cookie);
                    self.setUser(data.user);
                    success(data.user)
                },error),error);
            },error);
        };

        this.fbConnect=function (token, success, error){
            Main.request("get","/api/user/fb_connect/", {
                params: {
                    access_token: token
                }
            },getSuccess(function(data){
                setToken(data.cookie);
                self.getUserInfo(function (user) {
                    success(user);
                },error);
            },error), error);
        };

        this.getUserInfo=function (success, error){
            if(!getToken()) return;
            Main.request("get","/api/user/get_currentuserinfo/", {
                params: {
                    cookie: getToken()
                }
            },getSuccess(function(data){
                self.setUser(data.user);
                success(data.user);
            },error), error);
        };

        this.validateToken=function (success, error){
            Main.request("get","/api/user/validate_auth_cookie/", {
                params: {
                    cookie: getToken()
                }
            },getSuccess(function(data){
                success(data.valid);
            },error), error);
        };

        this.forgotPassword=function (user, success, error){
            if(typeof user!=="string") return;
            Main.request("get","/api/user/retrieve_password/", {
                params: {
                    user_login: user
                }
            },getSuccess(function(data){
                success(data.msg);
            },error), error);
        };
    })
;