(function () {
    'use strict';
    angular.module('app', ['ui.router', 'stripe', 'ui.bootstrap', 'ng-currency']).config(Config)

    function Config($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $locationProvider) {
        $stateProvider.state('Home', {
            url: '/',
            templateUrl: '/templates/home.html',
            controller: 'HomeController as vm'
        }).state("Welcome", {
            url: "/welcome",
            templateUrl: "/templates/welcome.html",
            controller: "WelcomeController as vm"
        }).state('About', {
            url: '/about',
            templateUrl: '/templates/about.html'
        }).state('Candidate', {
            url: '/candidate/:id',
            templateUrl: '/templates/candidate.html',
            controller: 'CandidateController as vm'
        }).state('Reg', {
            url: '/reg',
            templateUrl: '/templates/testreg.html'
        }).state('Log', {
            url: '/login',
            templateUrl: '/templates/testlogin.html'
        }).state("Contact", {
            url: "/contact",
            templateUrl: "/templates/contact.html",
            controller: "ContactFormController as vm"
        }).state("PasswordReset", {
            url: "/passwordReset",
            templateUrl: "/templates/passwordReset.html",
            controller: "PasswordResetController as vm"
        }).state("ContactMessageConfirmation", {
            url: "/contactMessageConfirmation",
            templateUrl: "/templates/contactMessageConfirmation.html",
        }).state("PasswordResetConfirmation", {
            url: "/passwordResetConfirmation",
            templateUrl: "/templates/passwordResetConfirmation.html",
        }).state('Stripe', {
            url: '/stripe',
            templateUrl: '/templates/stripe.html',
            controller: 'StripeController as vm'
        });
        $urlRouterProvider.otherwise('/');
        $urlMatcherFactoryProvider.caseInsensitive(true);
        $urlMatcherFactoryProvider.strictMode(false);
        $locationProvider.html5Mode(true);
        Stripe.setPublishableKey('pk_test_bI1AnQTe8bcz1Wxfh2Hls1SS');
    }
})();

angular.module('stripe', []).directive('stripeForm', ['$window', function ($window) {

    var directive = {
        restrict: 'A'
    };
    directive.link = function (scope, element, attributes) {
        var form = angular.element(element);
        form.bind('submit', function () {
            var button = form.find('button');
            button.prop('disabled', true);
            $window.Stripe.createToken(form[0], function () {
                button.prop('disabled', false);
                var args = arguments;
                scope.$apply(function () {
                    scope.$eval(attributes.stripeForm).apply(scope, args);
                });
            });
        });
    };
    return directive;

}]);

(function () {
    'use strict';
    angular.module('app').controller('CandidateController', CandidateController);

    function CandidateController($scope, $timeout, $stateParams, $animate, TweetFactory, CandidateFactory, CommentFactory, UserFactory) {
        var vm = this;
        vm.tweets;
        vm.timeoutHandler;
        vm.comments;
        vm.isEditing = false, vm.daily = true, vm.weekly = false;
        var candidateName;
        var dailyTotals = [],
            dailyDates = [],
            favorData = [];
        var weeklyData = [],
            weeklyPercent = [],
            weeklyDates = [];
        var day = [],
            week = [],
            runningWeekPercent = 0;
        var m = {
            top: 30,
            right: 80,
            bottom: 30,
            left: 80
        }; //margins
        var vizWidth = document.getElementById('vizWidth').clientWidth;
        vm.width = vizWidth - m.right - m.left;
        var myEl = angular.element(document.querySelector('#dailyViz'));
        var myElWeek = angular.element(document.querySelector('#weeklyViz'));


        window.onresize = function () {
            vizWidth = document.getElementById('vizWidth').clientWidth;
            vm.width = vizWidth - m.right - m.left;
            vm.runViz();
        }

        vm.showDaily = function () {
            $scope.weeklyV = "animated bounceOutRight";
            setTimeout(function () {
                vm.weekly = false;
                vm.daily = true;
                $scope.dailyV = "animated bounceInLeft";
            }, 60);
        }

        vm.showWeekly = function () {
            $scope.dailyV = "animated bounceOutLeft";
            setTimeout(function () {
                vm.daily = false;
                vm.weekly = true;
                $scope.weeklyV = "animated bounceInRight";
            }, 60)
        }

        vm.runViz = function () {
            myEl.empty();
            myElWeek.empty();

            var height = 500 - m.top - m.bottom;

            // X scale will fit all values from dailyTotals[] within pixels 0-w
            var x = d3.scale.linear().domain([0, dailyDates.length - 1]).range([0, vm.width]);
            // Y scale will fit values from 0-100 within pixels h-0
            var y = d3.scale.linear().domain([0, 100]).range([height, 0]);

            // create a line function that can convert dailyTotals[] into x and y points
            var line = d3.svg.line().x(function (d, i) {
                return x(i);
            }).y(function (d) {
                return y(d);
            })

            // Add an SVG(scalable vector graphics) element with the desired dimensions and margin.
            var graph = d3.select("#dailyViz").append("svg").attr("width", vm.width + m.right + m.left).attr("height", height + m.top + m.bottom).append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");

            var formatDate = function (d) {
                return dailyDates[d];
            }

            // create xAxis
            var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(dailyDates.length - 1).tickFormat(formatDate).tickSize(-height);
            // Add the x-axis.
            graph.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
            // create yAxis, use orient to put it on left side of graph
            var yAxis = d3.svg.axis().scale(y).ticks(10).orient("left");
            // Add the y-axis to the left, position with translate parameters
            graph.append("g").attr("class", "y axis").attr("transform", "translate(-25,0)").call(yAxis);

            graph.append("path").attr("d", line(dailyTotals));

            // ----------------------------------------------------------------------
            // -----------------------------WEEKLY VIZ-------------------------------
            // ----------------------------------------------------------------------
            var xWeek = d3.scale.linear().domain([0, weeklyData.length - 1]).range([0, vm.width]);

            var graphWeek = d3.select("#weeklyViz").append("svg").attr("width", vm.width + m.right + m.left).attr("height", height + m.top + m.bottom).append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");

            var lineWeek = d3.svg.line().x(function (d, i) {
                return xWeek(i);
            }).y(function (d) {
                return y(d);
            })

            var formatDateWeek = function (d) {
                return weeklyDates[d];
            }

            var xAxisWeek = d3.svg.axis().scale(xWeek).orient("bottom").ticks(weeklyDates.length - 1).tickFormat(formatDateWeek).tickSize(-height);

            graphWeek.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxisWeek);

            graphWeek.append("g").attr("class", "y axis").attr("transform", "translate(-25,0)").call(yAxis);

            graphWeek.append("path").attr("d", lineWeek(weeklyPercent));

        }

        CandidateFactory.getCandidateById($stateParams.id).then(function (res) {
            vm.candidate = res;
            candidateName = res.name;
            for (var i = res.favorRatingTotals.length - 1; i > res.favorRatingTotals.length - 8 && i >= 0; i--) {
                dailyTotals.unshift(res.favorRatingTotals[i].percentage);
                dailyDates.unshift(res.favorRatingTotals[i].date);
                favorData.unshift(res.favorRatingTotals[i]);
            }
            for (var a = 0; a < res.favorRatingTotals.length - 1; a++) {
                day.push(res.favorRatingTotals[a]);
                runningWeekPercent += res.favorRatingTotals[a].percentage;
                if (day.length == 7) {
                    var currentWeek = {};
                    currentWeek.percentage = ((runningWeekPercent / 7));
                    currentWeek.date = day[6].date;
                    weeklyData.push(currentWeek);
                    weeklyPercent.push(currentWeek.percentage);
                    weeklyDates.push(currentWeek.date)
                    if (weeklyDates.length == 8) {
                        weeklyDates.shift();
                        weeklyPercent.shift();
                        weeklyData.shift();
                    }
                    day = [], runningWeekPercent = 0;
                }
            }

            vm.runViz();


        }, function (err) {
            //
        });

        (function tick() {
            TweetFactory.getCandidateTweets(candidateName).then(function (res) {
                vm.tweets = res;
                vm.timeoutHandler = $timeout(tick, 1000);
            }, function (err) {
                //
            });
        })();

        // Cancel interval on page change
        $scope.$on('$destroy', function () {
            if (angular.isDefined(vm.timeoutHandler)) {
                $timeout.cancel(vm.timeoutHandler);
                vm.timeoutHandler = undefined;
            }
        });

        CommentFactory.getAllCandidateComments($stateParams.id).then(function (res) {
            vm.candidate = res;
        }, function (err) {
            //
        });

        vm.createComment = function () {
            if (!UserFactory.status._id) {
                //'cant post if not logged in' hacker easter egg alert
                return;
            }
            CommentFactory.createComment(vm.comment, $stateParams.id).then(function (res) {
                vm.candidate.comments.unshift(res);
                vm.comment = null;
                //some success toast
                //$state change?
            }, function (err) {
                //some error popup/toast
            });
        };

        vm.deleteComment = function (comment) {
            if (!UserFactory.status._id) {
                return;
            }
            else if (UserFactory.status._id !== comment.user) {
                alert('You cannot delete this comment');
                return;
            }
            console.log(comment);
            CommentFactory.deleteComment(comment._id).then(function (res) {
                vm.candidate.comments.splice(vm.candidate.comments.indexOf(comment), 1);
            }, function (err) {
                alert('could not delete comment');
            });
        };

        vm.showUpdate = function (comment) {
            vm.isEditing = comment._id;
            // vm.commentToEdit = comment;
            vm.editedComment = angular.copy(comment);
        };

        vm.updateComment = function (comment) {
            if (!UserFactory.status._id || UserFactory.status._id !== comment.user) {
                alert('You cannot update this comment');
                return;
            };
            CommentFactory.updateComment(vm.editedComment, comment).then(function (res) {
                vm.candidate.comments.splice(vm.candidate.comments.indexOf(comment), 1);
                vm.candidate.comments.unshift(vm.editedComment);
                vm.isEditing = null;
                vm.editedComment = null;
            }, function (err) {
                alert('could not update comment');
            });
        };



    }
})();

(function () {
    'use strict';

    angular.module('app').controller(CommentController, 'CommentController');

    function CommentController(CommentFactory, $stateParams, UserFactory) {
        var vm = this;

        CommentFactory.getAllComments($stateParams.id).then(function (res) {
            vm.comments = res;
        }, function (err) {
            //
        });

        vm.createComment = function () {
            CommentFactory.createComment(vm.comment, $stateParams.id).then(function (res) {
                //
            }, function (err) {
                //some error popup/toast
            });
        };
    }

})();

(function () {
    'use strict';
    angular.module('app').controller('ContactFormController', ContactFormController);


    function ContactFormController(EmailFactory, SMSFactory, $state, $stateParams) {
        var vm = this;
        vm.sms = {};

        vm.emailConfirm = function () {
            swal({
                title: "Confirmation:",
                text: "Please confirm that you want to send this message",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#82DD51",
                confirmButtonText: "Yes, send it!",
                cancelButtonColor: "#DD6B55",
                cancelButtonText: "Nevermind!",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    swal("Sent!", "Thank you for your email!", "success");
                    vm.sendMail();
                } else {
                    swal("Cancelled!", "Your message has not been sent", "error");
                }
            });
        }

        vm.smsConfirm = function () {
            swal({
                title: "Confirmation:",
                text: "Please confirm that you want to send this text",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#82DD51",
                confirmButtonText: "Yes, send it!",
                cancelButtonColor: "#DD6B55",
                cancelButtonText: "Nevermind!",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    swal("Sent!", "Thank you for your text!", "success");
                    vm.sendSMS();
                } else {
                    swal("Cancelled!", "Your text has not been sent", "error");
                }
            });
        }


        vm.sendSMS = function () {
            SMSFactory.sendSMS(vm.sms).then(function (res) {
                vm.sms.firstName = "";
                vm.sms.phoneNumber = "";
                vm.sms.message = "";
            }, function (err) {

            });
        };

        vm.sendMail = function () {
            var data = ({
                contactName: vm.contactName,
                contactEmail: vm.contactEmail,
                contactMsg: vm.contactMsg
            });
            EmailFactory.sendMail(data).then(function (res) {

            }, function (err) {

            });
        };
    }
})();

(function () {
    'use strict';
    angular.module('app').controller('GlobalController', GlobalController).controller("RegisterModalController", RegisterModalController).controller("LoginModalController", LoginModalController)

    function GlobalController(UserFactory, $state, $uibModal) {
        var vm = this;
        vm.user = {};
        vm.status = UserFactory.status;

        // vm.register = function() {
        //     UserFactory.register(vm.user).then(function(res) {
        //         $state.go('Home');
        //         nav.user.password = null;
        //         nav.user.email = null;
        //     });
        // };
        vm.login = function () {
            UserFactory.login(vm.user).then(function (res) {
                $state.go('Home');
                vm.user.password = null;
                vm.user.email = null;
            });
        };

        vm.logout = function () {
            UserFactory.removeToken();
            $state.go('Home');
        };

        vm.openReg = function (size) {
            var modalInstance = $uibModal.open({
                templateUrl: "/templates/partials/registrationModal.html",
                size: "md",
                controller: "RegisterModalController as vm"
            });

            modalInstance.result.then(function (user) {
                console.log(user)
            }, function () {
                console.log("error")
            });
        };

        vm.openLogin = function (size) {
            var modalInstance = $uibModal.open({
                templateUrl: "/templates/partials/loginModal.html",
                size: "md",
                controller: "LoginModalController as vm"
            });

            modalInstance.result.then(function (user) {
                console.log(user)
            }, function () {
                console.log("error")
            });
        };
    }

    function RegisterModalController($scope, $uibModalInstance, UserFactory) {
        var vm = this;
        vm.user = {};
        $scope.ok = function () {
            UserFactory.register(vm.user).then(function (res) {
                $uibModalInstance.close(vm.user);
            });
            vm.loading = true;
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss("cancel");
        };
    }

    function LoginModalController($scope, $uibModalInstance, UserFactory) {
        var vm = this;
        vm.user = {};
        $scope.ok = function () {
            UserFactory.login(vm.user).then(function (res) {
                $uibModalInstance.close(vm.user);
            });
            vm.loading = true;
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss("cancel");
        };
    }
})();

(function () {
    'use strict';
    angular.module('app').controller('HomeController', HomeController)

    function HomeController($scope, $state, $location, $timeout, UserFactory, TweetFactory, CandidateFactory, $window) {
        var vm = this;
        var url = $location.search();
        var size = 0;
        vm.timeoutHandler;
        vm.bernie;
        vm.clinton;
        vm.trump;
        vm.rubio;

        CandidateFactory.getPresidentialCandidates().then(function (res) {
            vm.candidates = res;
        }, function (err) {
            //
        });

        if (url.code) {
            UserFactory.setToken(url.code);
            $location.search("code", null);
            $location.hash('');
        }

        // Updating client side every 15 seconds(this function). Pulling from last 5 minutes of data(tweetRoutes.js)
        (function tick() {
            TweetFactory.getRecentTweets().then(function (res) {
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

            }, function (err) {
                //
            });
        })();

        // Cancel interval on page change
        $scope.$on('$destroy', function () {
            if (angular.isDefined(vm.timeoutHandler)) {
                $timeout.cancel(vm.timeoutHandler);
                vm.timeoutHandler = undefined;
            }
        });

    }
})();

(function () {
    'use strict';
    angular.module('app').controller('PasswordResetController', PasswordResetController).controller("PasswordEmailModalController", PasswordEmailModalController).controller("PasswordSMSModalController", PasswordSMSModalController)

    function PasswordResetController(EmailFactory, SMSFactory, UserFactory, $state, $stateParams, $uibModal) {
        var vm = this;
        var registeredPh;
        var registeredEmail;
        vm.user = {};
        vm.data = {};
        vm.code = {};
        vm.sentCode = false;
        vm.sentEmail = false;
        vm.codeValidated = false;
        vm.wrongCode = false;
        vm.unregisteredPhone = false;
        vm.unregisteredEmail = false;
        vm.user.phoneNumber = "";
        vm.user.email = "";
        // vm.data.generatedCode = code;
        vm.data.email = vm.user.email;
        // 1st section *******************************************************
        vm.sendCode = function () {
            console.log("FUUUUUUCK")
            if (vm.user.phoneNumber) {
                SMSFactory.receiveSMSCode(vm.user).then(function (res) {
                    vm.sentCode = true;
                    vm.code.phoneNumber = vm.user.phoneNumber;
                    vm.openModal("PasswordSMSModalController");
                }, function (err) {});
            }

            if (vm.user.email) {
                EmailFactory.receiveEmailCode(vm.user).then(function (res) {
                    vm.sentEmail = true;
                    vm.code.email = vm.user.email;
                    vm.openModal("PasswordEmailModalController");
                }, function (err) {});
            }
        };


        // 2nd section *******************************************************
        vm.validateCode = function () {
            SMSFactory.validateCode(vm.code).then(function (res) {
                $state.go("Home");
            });
        };

        // vm.validateEmailCode = function() {
        //     EmailFactory.validateEmailCode(vm.code).then(function(res) {
        //         $state.go("Home");
        //     });
        // };
        vm.openModal = function (ctrl) {
            var modalInstance = $uibModal.open({
                templateUrl: "/templates/partials/passwordValidate.html",
                size: "md",
                controller: ctrl + " as vm",
                resolve: {
                    code: function () {
                        return vm.code;
                    }
                }
            });

            modalInstance.result.then(function (user) {}, function () {
                console.log("error")
            });
        };
    }

    function PasswordEmailModalController($scope, $uibModalInstance, EmailFactory, code, $state) {
        var vm = this;
        vm.code = code;
        vm.user = {};
        $scope.ok = function () {
            EmailFactory.validateEmailCode(vm.code).then(function (res) {
                $state.go("Home");
                $uibModalInstance.close();
            });

            vm.loading = true;
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss("cancel");
        };
    }

    function PasswordSMSModalController($scope, $uibModalInstance, SMSFactory, code, $state) {
        var vm = this;
        vm.code = code;
        vm.user = {};
        $scope.ok = function () {
            SMSFactory.validateCode(vm.code).then(function (res) {
                $state.go("Home");
                $uibModalInstance.close();
            });
            vm.loading = true;
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss("cancel");
        };
    }
})();

(function () {
    'use strict';
    angular.module('app').controller('ProfileController', ProfileController);

    function ProfileController() {
        var vm = this;

    }
})();

(function () {
    'use strict';
    angular.module("app").controller("StripeController", StripeController);

    function StripeController(StripeFactory, $state) {
        var vm = this;
        vm.donationAmount = 20.00;

        vm.stripeCallback = function (status, response) {
            // console.log(status);
            // console.log(response);
            StripeFactory.postCharge(response.id, vm.donationAmount).then(function (res) {
                // console.log(res);
                swal("Thank you for your donation!", "You have been upgraded to a premium account!", "success");
                $state.go('Home');
            }, function (err) {
                swal('Unable to process donation.', "Please check your payment information and try again.", 'error');
            });
        };
    }
})();

(function () {
    "use strict";
    angular.module("app").controller("WelcomeController", WelcomeController);

    function WelcomeController($state, $location, UserFactory) {
        var vm = this;
        var url = $location.search();

        if (url.code) {
            UserFactory.setToken(url.code);
            $location.search("code", null);
        }
    };
})();
(function () {
    'use strict';
    angular.module('app').factory('CandidateFactory', CandidateFactory);

    function CandidateFactory($http, $q) {
        var o = {};

        o.getPresidentialCandidates = function () {
            var q = $q.defer();
            $http.get('/api/v1/candidates/presidential').then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        o.getCandidateById = function (id) {
            var q = $q.defer();
            $http.get('/api/v1/candidates/' + id).then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        return o;
    }
})();

(function () {
    'use strict';
    angular.module('app').factory('CommentFactory', CommentFactory);

    function CommentFactory($http, $q, $window) {
        var o = {};

        o.deleteComment = function (commentId) {
            var q = $q.defer();
            $http.delete('/api/v1/comments/' + commentId, {
                headers: {
                    authorization: 'Bearer ' + $window.localStorage.getItem('token')
                }
            }).then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();

            });
            return q.promise;
        };

        o.getAllCandidateComments = function (candidateId) {
            var q = $q.defer();
            $http.get('/api/v1/comments/' + candidateId).then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        o.createComment = function (comment, candidateId) {
            var q = $q.defer();
            $http.post('/api/v1/comments/' + candidateId, {
                message: comment
            }, {
                headers: {
                    authorization: 'Bearer ' + $window.localStorage.getItem('token')
                }
            }).then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        o.updateComment = function (newComment, oldComment) {
            var q = $q.defer();
            $http.put('/api/v1/comments/' + oldComment._id, newComment, {
                headers: {
                    authorization: 'Bearer ' + $window.localStorage.getItem('token')
                }
            }).then(function (res) {
                q.resolve(res.data)
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        return o;
    };
})();
(function () {
    'use strict';
    angular.module('app').factory('EmailFactory', EmailFactory);

    function EmailFactory($http, $q) {
        var o = {};

        o.receiveEmailCode = function (user) {
            var q = $q.defer();
            $http.post("/api/v1/contact/receiveCode", user).then(function (res) {
                q.resolve();
            }, function (err) {
                q.reject();
            });
            return q.promise;
        }

        o.validateEmailCode = function (code) {
            var q = $q.defer();
            $http.post("/api/v1/contact/validate", code).then(function (res) {
                q.resolve();
            });
            return q.promise;
        };

        o.sendMail = function (data) {
            var q = $q.defer();
            $http.post('/api/v1/contact/send', data).then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };
        o.sendMailCode = function (data) {
            var q = $q.defer();
            $http.post('/api/v1/contact/sendCode', data).then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };
        return o;
    }
})();
(function () {
    'use strict';
    angular.module('app').factory('SMSFactory', SMSFactory);

    function SMSFactory($http, $q) {
        var o = {};

        o.receiveSMSCode = function (sms) {
            console.log(sms);
            var q = $q.defer();
            $http.post('/api/v1/sms/receiveCode', sms).then(function (res) {
                q.resolve();
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        o.sendSMS = function (sms) {
            var q = $q.defer();
            $http.post('/api/v1/sms/send', sms).then(function (res) {
                q.resolve();
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        o.validateCode = function (code) {
            var q = $q.defer();
            $http.post("/api/v1/sms/validate", code).then(function (res) {
                q.resolve();
            });
            return q.promise;
        };

        return o;
    }
})();

(function () {
    'use strict';
    angular.module('app').factory('SentimentFactory', SentimentFactory);

    function SentimentFactory($http, $q) {
        var o = {};



        return o;
    }
})();

(function () {
    "use strict";
    angular.module("app").factory("StripeFactory", StripeFactory);

    function StripeFactory($q, $http, $window, UserFactory) {
        var o = {};

        o.postCharge = function (token, donationAmount) {
            var q = $q.defer();
            var chargeObject = {};
            chargeObject.email = UserFactory.status.email;
            chargeObject.token = token;
            //setting amount on the chargeObject to user-selected amount and changing to cents
            chargeObject.amount = donationAmount * 100;
            $http.post('api/v1/invoice/charge', chargeObject, {
                headers: {
                    authorization: 'Bearer ' + $window.localStorage.getItem('token')
                }
            }).then(function (res) {
                UserFactory.status.premiumStatus = true;
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;

        };

        return o;
    }
})();
(function () {
    'use strict';
    angular.module('app').factory('TweetFactory', TweetFactory);

    function TweetFactory($http, $q, $timeout) {
        var o = {};

        o.getRecentTweets = function () {
            var q = $q.defer();
            $http.get('/api/v1/tweets').then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        o.getCandidateTweets = function (candidate) {
            var q = $q.defer();
            $http.get('/api/v1/tweets/' + candidate).then(function (res) {
                q.resolve(res.data);
            }, function (err) {
                q.reject();
            });
            return q.promise;
        };

        return o;
    }
})();

(function () {
    "use strict";
    angular.module("app").factory("UserFactory", UserFactory);

    function UserFactory($q, $http, $window) {
        var o = {};
        o.status = {};

        o.register = function (user) {
            var q = $q.defer();
            $http.post('/api/v1/users/register', user).then(function (res) {
                o.setToken(res.data.token);
                q.resolve(res.data);
            });
            return q.promise;
        };

        o.resetPassword = function (user) {
            var q = $q.defer();
            $http.post('/api/v1/users/resetPassword', user).then(function (res) {
                q.resolve();
            });
            return q.promise;
        };

        o.phoneExists = function (user) {
            var q = $q.defer();
            $http.post('/api/v1/users/registeredPhone', user).then(function (res) {
                q.resolve(res.data);
            });
            return q.promise;
        };

        o.emailExists = function (user) {
            var q = $q.defer();
            $http.post('/api/v1/users/registeredEmail', user).then(function (res) {
                q.resolve(res.data);
            });
            return q.promise;
        };


        o.login = function (user) {
            var q = $q.defer();
            $http.post('/api/v1/users/login', user).then(function (res) {
                o.setToken(res.data.token);
                q.resolve(res.data);
            });
            return q.promise;
        };

        o.getToken = function () {
            return $window.localStorage.getItem("token");
        };

        o.setToken = function (token) {
            $window.localStorage.setItem("token", token);
            o.setUser();
        };

        o.removeToken = function () {
            $window.localStorage.removeItem("token");
            o.status._id = null;
            o.status.uuid = null;
            o.status.premiumStatus = null;
            o.status.email = null;
        };

        o.setUser = function () {
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