(function() {
    'use strict';
    angular.module('app')
        .controller('PasswordResetController', PasswordResetController)
        .controller("PasswordEmailModalController", PasswordEmailModalController)
        .controller("PasswordSMSModalController", PasswordSMSModalController)

    function PasswordResetController(EmailFactory, SMSFactory, UserFactory, $state, $stateParams, $uibModal) {
        var vm = this;
        var registeredPh;
        var registeredEmail;
        vm.user = {};
        vm.data = {};
        vm.code = {};
        vm.sentCode = false;
        vm.sentEmail = false;
        vm.codeValidated = false;
        vm.wrongCode = false;
        vm.unregisteredPhone = false;
        vm.unregisteredEmail = false;
        vm.user.phoneNumber = "";
        vm.user.email = "";
        // vm.data.generatedCode = code;
        vm.data.email = vm.user.email;
        // 1st section *******************************************************
        vm.sendCode = function() {
            console.log("FUUUUUUCK")
            if (vm.user.phoneNumber) {
                SMSFactory.receiveSMSCode(vm.user).then(function(res) {
                    vm.sentCode = true;
                    vm.code.phoneNumber = vm.user.phoneNumber;
                    vm.openModal("PasswordSMSModalController");
                }, function(err) {});
            }

            if (vm.user.email) {
                EmailFactory.receiveEmailCode(vm.user).then(function(res) {
                    vm.sentEmail = true;
                    vm.code.email = vm.user.email;
                    vm.openModal("PasswordEmailModalController");
                }, function(err) {});
            }
        };


        // 2nd section *******************************************************
        vm.validateCode = function() {
            SMSFactory.validateCode(vm.code).then(function(res) {
                $state.go("Home");
            });
        };

        // vm.validateEmailCode = function() {
        //     EmailFactory.validateEmailCode(vm.code).then(function(res) {
        //         $state.go("Home");
        //     });
        // };

        vm.openModal = function(ctrl) {
            var modalInstance = $uibModal.open({
                templateUrl: "/templates/partials/passwordValidate.html",
                size: "md",
                controller: ctrl + " as vm",
                resolve: {
                    code: function() {
                        return vm.code;
                    }
                }
            });

            modalInstance.result.then(function(user) {
            }, function() {
                console.log("error")
            });
        };
    }

    function PasswordEmailModalController($scope, $uibModalInstance, EmailFactory, code, $state) {
        var vm = this;
        vm.code = code;
        vm.user = {};
        $scope.ok = function() {
            EmailFactory.validateEmailCode(vm.code).then(function(res) {
                $state.go("Home");
                $uibModalInstance.close();
            });

            vm.loading = true;
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }

    function PasswordSMSModalController($scope, $uibModalInstance, SMSFactory, code, $state) {
        var vm = this;
        vm.code = code;
        vm.user = {};
        $scope.ok = function() {
            SMSFactory.validateCode(vm.code).then(function(res) {
                $state.go("Home");
                $uibModalInstance.close();
            });
            vm.loading = true;
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }
})();
