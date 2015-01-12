angular.module('App.controllers')

    .controller('loginCtrl', function ($scope) {

    })
    .controller('registerCtrl', function ($scope) {

    })

    .controller('mainCtrl', function ($scope, $ionicActionSheet, $state) {
        $scope.goBack = function() {
            $state.back();
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
                    return true;
                }
            });

        };
    });