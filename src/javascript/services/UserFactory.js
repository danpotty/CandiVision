(function() {
    "use strict";
    angular.module("app").factory("UserFactory", UserFactory);

    function UserFactory($q, $http, $window) {
        var o = {};
        o.status = {};

        o.register = function(user) {
            var q = $q.defer();
            $http.post('/api/v1/users/register', user).then(function(res) {
                o.setToken(res.data.token);
                q.resolve(res.data);
            });
            return q.promise;
        };

        o.resetPassword = function(user) {
            var q = $q.defer();
            $http.post('/api/v1/users/resetPassword', user).then(function(res) {
                q.resolve();
            });
            return q.promise;
        };

        o.phoneExists = function(user) {
            var q = $q.defer();
            $http.post('/api/v1/users/registeredPhone', user).then(function(res) {
                q.resolve(res.data);
            });
            return q.promise;
        };

        o.emailExists = function(user) {
            var q = $q.defer();
            $http.post('/api/v1/users/registeredEmail', user).then(function(res) {
                q.resolve(res.data);
            });
            return q.promise;
        };


        o.login = function(user) {
            var q = $q.defer();
            $http.post('/api/v1/users/login', user).then(function(res) {
                o.setToken(res.data.token);
                q.resolve(res.data);
            });
            return q.promise;
        };

        o.getToken = function() {
            return $window.localStorage.getItem("token");
        };

        o.setToken = function(token) {
            $window.localStorage.setItem("token", token);
            o.setUser();
        };

        o.removeToken = function() {
            $window.localStorage.removeItem("token");
            o.status._id = null;
            o.status.uuid = null;
            o.status.premiumStatus = null;
            o.status.email = null;
        };

        o.setUser = function() {
            var token = JSON.parse(atob(o.getToken().split(".")[1]));
            o.status._id = token._id;
            o.status.email = token.email;
            o.status.uuid = token.uuid;
            o.status.premiumStatus = token.premiumStatus;
        };

        if (o.getToken()) o.setUser();

        return o;
    }
})();
