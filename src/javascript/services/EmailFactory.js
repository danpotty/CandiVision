(function() {
    'use strict';
    angular.module('app')
    .factory('EmailFactory', EmailFactory);
    function EmailFactory($http, $q) {
        var o = {};

        o.receiveEmailCode = function(user){
            var q = $q.defer();
            $http.post("/api/v1/contact/receiveCode", user).then(function(res){
                q.resolve();
            }, function(err){
                q.reject();
            });
            return q.promise;
        }

        o.validateEmailCode = function(code) {
            var q = $q.defer();
            $http.post("/api/v1/contact/validate", code).then(function(res) {
                q.resolve();
            });
            return q.promise;
        };

        o.sendMail = function(data) {
            var q = $q.defer();
            $http.post('/api/v1/contact/send', data).then(function(res) {
                q.resolve(res.data);
            }, function(err) {
                q.reject();
            });
            return q.promise;
        };
        o.sendMailCode = function(data) {
            var q = $q.defer();
            $http.post('/api/v1/contact/sendCode', data).then(function(res) {
                q.resolve(res.data);
            }, function(err) {
                q.reject();
            });
            return q.promise;
        };
        return o;
    }
})();