(function() {
	'use strict';

	angular.module('app').controller(CommentController, 'CommentController');

	function CommentController (CommentFactory, $stateParams, UserFactory) {
		var vm = this;

		CommentFactory.getAllComments($stateParams.id).then(function(res) {
			vm.comments = res;
		}, function(err){
			//
		});

		vm.createComment = function() {
			CommentFactory.createComment(vm.comment, $stateParams.id).then(function(res){
				//
				}, function(err) {
				//some error popup/toast
			});
		};
	}

})();
