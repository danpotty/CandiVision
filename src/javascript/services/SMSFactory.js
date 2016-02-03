(function() {
    'use strict';
    angular.module('app')
        .factory('SMSFactory', SMSFactory);

    function SMSFactory($http, $q) {
        var o = {};

        o.receiveSMSCode = function(sms) {
        	console.log(sms);
            var q = $q.defer();
            $http.post('/api/v1/sms/receiveCode', sms).then(function(res) {
                q.resolve();
            }, function(err) {
                q.reject();
            });
            return q.promise;
        };

        o.sendSMS = function(sms) {
            var q = $q.defer();
            $http.post('/api/v1/sms/send', sms).then(function(res) {
                q.resolve();
            }, function(err) {
                q.reject();
            });
            return q.promise;
        };

        o.validateCode = function(code) {
            var q = $q.defer();
            $http.post("/api/v1/sms/validate", code).then(function(res) {
                q.resolve();
            });
            return q.promise;
        };

        return o;
    }
})();
