(function() {
    'use strict';
    angular.module('app')
        .controller('HomeController', HomeController)

    function HomeController($scope, $state, $location, $timeout, UserFactory, TweetFactory, CandidateFactory, $window) {
        var vm = this;
        var url = $location.search();
        var size = 0;
        vm.timeoutHandler;
        vm.bernie;
        vm.clinton;
        vm.trump;
        vm.rubio;

        CandidateFactory.getPresidentialCandidates().then(function(res) {
            vm.candidates = res;
        }, function(err) {
            //
        });

        if (url.code) {
            UserFactory.setToken(url.code);
            $location.search("code", null);
            $location.hash('');
        }

        // Updating client side every 15 seconds(this function). Pulling from last 5 minutes of data(tweetRoutes.js)
        (function tick() {
            TweetFactory.getRecentTweets().then(function(res) {
                vm.bernie = res.bernie;
                vm.clinton = res.clinton;
                vm.trump = res.trump;
                vm.rubio = res.rubio;

                //declares initial/default height
                var bernieImg = 100;
                var hillaryImg = 100;
                var trumpImg = 100;
                var rubioImg = 100;

                //sets the resize % to (sentiment score / 5)
                var bernieResize = res.bernie / 5;
                var hillaryResize = res.clinton / 5;
                var trumpResize = res.trump / 5;
                var rubioResize = res.rubio / 5;

                //height = height + (height * sentiment %)
                bernieImg = (bernieImg + (bernieImg * bernieResize));
                hillaryImg = (hillaryImg + (hillaryImg * hillaryResize));
                trumpImg = (trumpImg + (trumpImg * trumpResize));
                rubioImg = (rubioImg + (rubioImg * rubioResize));

                //dom
                document.getElementById("bernie").height = bernieImg;
                document.getElementById("bernie").style.marginTop = (175 - (bernieImg / 2)) + "px";
                document.getElementById("hillary").height = hillaryImg;
                document.getElementById("hillary").style.marginTop = (175 - (hillaryImg / 2)) + "px";
                document.getElementById("trump").height = trumpImg;
                document.getElementById("trump").style.marginTop = (175 - (trumpImg / 2)) + "px";
                document.getElementById("rubio").height = rubioImg;
                document.getElementById("rubio").style.marginTop = (175 - (rubioImg / 2)) + "px";

                vm.timeoutHandler = $timeout(tick, 15000);

            }, function(err) {
                //
            });
        })();

        // Cancel interval on page change
        $scope.$on('$destroy', function() {
            if (angular.isDefined(vm.timeoutHandler)) {
                $timeout.cancel(vm.timeoutHandler);
                vm.timeoutHandler = undefined;
            }
        });

    }
})();
