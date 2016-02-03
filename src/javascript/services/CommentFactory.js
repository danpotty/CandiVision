(function() {
	'use strict';
	angular.module('app')
	.factory('CommentFactory', CommentFactory);

	function CommentFactory($http, $q, $window) {
		var o = {};

		o.deleteComment = function(commentId) {
			var q = $q.defer();
			$http.delete('/api/v1/comments/' + commentId,{
				headers: {
					authorization: 'Bearer ' + $window.localStorage.getItem('token')
				}
			}).then(function(res) {
				q.resolve(res.data);
				}, function(err) {
					q.reject();

				});
				return q.promise;
			};

		o.getAllCandidateComments = function(candidateId) {
			var q = $q.defer();
			$http.get('/api/v1/comments/' + candidateId).then(function(res) {
				q.resolve(res.data);
			}, function(err) {
				q.reject();
			});
			return q.promise;
		};

		o.createComment = function(comment, candidateId) {
			var q = $q.defer();
			$http.post('/api/v1/comments/' + candidateId, { message: comment } ,{
				headers: {
					authorization: 'Bearer ' + $window.localStorage.getItem('token')
				}
			}).then(function(res){
				q.resolve(res.data);
			}, function(err){
				q.reject();
			});
			return q.promise;
		};

		o.updateComment = function(newComment, oldComment) {
			var q = $q.defer();
			$http.put('/api/v1/comments/' + oldComment._id, newComment ,{
				headers: {
					authorization: 'Bearer ' + $window.localStorage.getItem('token')
				}
			}).then(function(res) {
				q.resolve(res.data)
			}, function(err){
				q.reject();
			});
			return q.promise;
		};

		return o;
	};
})();