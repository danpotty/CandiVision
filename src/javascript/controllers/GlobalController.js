(function() {
    'use strict';
    angular.module('app')
        .controller('GlobalController', GlobalController)
        .controller("RegisterModalController", RegisterModalController)
        .controller("LoginModalController", LoginModalController)

    function GlobalController(UserFactory, $state, $uibModal) {
        var vm = this;
        vm.user = {};
        vm.status = UserFactory.status;

        // vm.register = function() {
        //     UserFactory.register(vm.user).then(function(res) {
        //         $state.go('Home');
        //         nav.user.password = null;
        //         nav.user.email = null;
        //     });
        // };

        vm.login = function() {
            UserFactory.login(vm.user).then(function(res) {
                $state.go('Home');
                vm.user.password = null;
                vm.user.email = null;
            });
        };

        vm.logout = function() {
            UserFactory.removeToken();
            $state.go('Home');
        };

        vm.openReg = function(size) {
            var modalInstance = $uibModal.open({
                templateUrl: "/templates/partials/registrationModal.html",
                size: "md",
                controller: "RegisterModalController as vm"
            });

            modalInstance.result.then(function(user) {
                console.log(user)
            }, function() {
                console.log("error")
            });
        };

        vm.openLogin = function(size) {
            var modalInstance = $uibModal.open({
                templateUrl: "/templates/partials/loginModal.html",
                size: "md",
                controller: "LoginModalController as vm"
            });

            modalInstance.result.then(function(user) {
                console.log(user)
            }, function() {
                console.log("error")
            });
        };
    }

    function RegisterModalController($scope, $uibModalInstance, UserFactory) {
        var vm = this;
        vm.user = {};
        $scope.ok = function() {
            UserFactory.register(vm.user).then(function(res) {
                $uibModalInstance.close(vm.user);
            });
            vm.loading = true;
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }

    function LoginModalController($scope, $uibModalInstance, UserFactory) {
        var vm = this;
        vm.user = {};
        $scope.ok = function() {
            UserFactory.login(vm.user).then(function(res) {
                $uibModalInstance.close(vm.user);
            });
            vm.loading = true;
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }
})();
