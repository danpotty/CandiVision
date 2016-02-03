angular.module("app").directive("myFooter", function() {
  return {
    restrict: 'A',
    templateUrl: '../templates/partials/footer.html',
    scope: true,
    transclude : false
    };
});
