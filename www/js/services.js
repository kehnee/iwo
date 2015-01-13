angular.module('App.services')
    .service('mainService', function () {
        this.user={
            firstName:"John",
            lastName: "Don",
            email:"john@example.com"
        }
    });