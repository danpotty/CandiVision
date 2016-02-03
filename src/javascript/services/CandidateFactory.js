(function() {
    'use strict';
    angular.module('app')
    .factory('CandidateFactory', CandidateFactory);

    function CandidateFactory($http, $q) {
        var o = {};

        o.getPresidentialCandidates = function() {
            var q = $q.defer();
            $http.get('/api/v1/candidates/presidential').then(function(res) {
                q.resolve(res.data);
            }, function(err) {
                q.reject();
            });
            return q.promise;
        };

        o.getCandidateById = function(id) {
            var q = $q.defer();
            $http.get('/api/v1/candidates/' + id).then(function(res) {
                q.resolve(res.data);
            }, function(err) {
                q.reject();
            });
            return q.promise;
        };

        return o;
    }
})();
