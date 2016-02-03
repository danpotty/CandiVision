(function() {
    'use strict';
      angular.module("app")
        .controller("StripeController", StripeController);

        function StripeController(StripeFactory, $state) {
          var vm = this;
          vm.donationAmount = 20.00;

          vm.stripeCallback = function(status, response) {
            // console.log(status);
            // console.log(response);
            StripeFactory.postCharge(response.id, vm.donationAmount).then(function(res) {
              // console.log(res);
              swal("Thank you for your donation!", "You have been upgraded to a premium account!", "success");
              $state.go('Home');
            }, function(err) {
                swal('Unable to process donation.', "Please check your payment information and try again.", 'error');
            });
          };
        }
})();
