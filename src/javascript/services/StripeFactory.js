	(function(){
	"use strict";
	angular.module("app").factory("StripeFactory", StripeFactory);
	function StripeFactory($q, $http, $window, UserFactory){
		var o = {};

		o.postCharge = function(token, donationAmount){
			var q = $q.defer();
			var chargeObject = {};
			chargeObject.email = UserFactory.status.email;
			chargeObject.token = token;
			//setting amount on the chargeObject to user-selected amount and changing to cents
			chargeObject.amount = donationAmount *100;
			$http.post('api/v1/invoice/charge', chargeObject, {
				headers: {
					authorization: 'Bearer ' + $window.localStorage.getItem('token')
				}
			}).then(function (res) {
				UserFactory.status.premiumStatus = true;
				q.resolve(res.data);
			},function(err) {
				q.reject();
			});
			return q.promise;

		};

		return o;
	}
})();