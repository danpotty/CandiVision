(function() {
    'use strict';
    angular.module('app')
    .factory('TweetFactory', TweetFactory);

    function TweetFactory($http, $q, $timeout) {
        var o = {};

        o.getRecentTweets = function() {
            var q = $q.defer();
            $http.get('/api/v1/tweets').then(function(res) {
                q.resolve(res.data);
            }, function(err) {
                q.reject();
            });
            return q.promise;
        };

        o.getCandidateTweets = function(candidate) {
            var q = $q.defer();
            $http.get('/api/v1/tweets/' + candidate).then(function(res) {
                q.resolve(res.data);
            }, function(err) {
                q.reject();
            });
            return q.promise;
        };

        return o;
    }
})();
