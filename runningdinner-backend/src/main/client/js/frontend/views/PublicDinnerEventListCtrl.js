(function(angular) {
  'use strict';

  angular.module('FrontendApp').controller('PublicDinnerEventListCtrl', PublicDinnerEventListCtrl);

  function PublicDinnerEventListCtrl($scope, $state, BaseController, PublicDinnerEventService) {

    var vm = this;
    vm.getLocation = getLocation;
    vm.getDinnerEventDetailsLink = getDinnerEventDetailsLink;
    vm.dinnerEvents = [];

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    showDinnerEvents();

    function showDinnerEvents() {
      vm.dinnerEventsLoading = true;
      PublicDinnerEventService.findPublicRunningDinners().then(function(response) {
        vm.dinnerEvents = response.publicRunningDinners;
      }).finally(function() {
        vm.dinnerEventsLoading = false;
      });
    }

    function getLocation(dinnerEvent) {
      return dinnerEvent.zip + " " + dinnerEvent.city;
    }

    function getDinnerEventDetailsLink(dinnerEvent) {
      var link = $state.href('frontend.eventdetails', { 'publicDinnerId': dinnerEvent.publicSettings.publicDinnerId });
      return link;
    }

  }

})(angular);
