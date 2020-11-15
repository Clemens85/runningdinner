(function(angular) {
  'use strict';

  angular.module('SelfAdminApp').controller('ChangeTeamHostCtrl', ChangeTeamHostCtrl);

  function ChangeTeamHostCtrl($scope, $state, $q, $translate, BaseController, NotificationService, SelfAdminService, fullnameFilter) {

    var vm = this;
    vm.changeTeamHost = changeTeamHost;
    vm.saveTeamHostChange = saveTeamHostChange;

    vm.changeTeamHostRequest = {};

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    _activate();

    function _activate() {

      vm.changeTeamHostRequest.selfAdministrationId = $state.params.selfAdministrationId;
      vm.changeTeamHostRequest.participantId = $state.params.participantId;
      vm.changeTeamHostRequest.teamId = $state.params.teamId;

      vm.findTeamPromise = SelfAdminService.findTeamAsync(vm.changeTeamHostRequest);
      vm.findTeamPromise
          .then(_applyTeamToView, _applyLoadingTeamError);
    }

    function changeTeamHost(newHostTeamMember) {
      vm.currentHostTeamMemberId = newHostTeamMember.id;
      vm.teamHostChanged = _isTeamHostChanged();
    }

    function saveTeamHostChange() {

      if (!_isTeamHostChanged()) {
        return $q.reject();
      }

      vm.changeTeamHostRequest.newHostingTeamMemberId = vm.currentHostTeamMemberId;

      return SelfAdminService.updateTeamHostAsync(vm.changeTeamHostRequest)
                              .then(function(updatedTeam) {
                                _applyTeamHostChangedResponse(updatedTeam);
                              });
    }

    function _applyTeamToView(team) {
      vm.team = team;
      vm.currentHostTeamMemberId = vm.team.hostTeamMember.id; // This variable will be edited
      vm.changeTeamHostRequest.newHostingTeamMemberId = vm.team.hostTeamMember.id; // This variable holds the original state

      vm.teamHostChanged = _isTeamHostChanged();
      vm.loadingTeamFailed = false;
    }

    function _applyTeamHostChangedResponse(updatedTeam) {

      // Notify user:
      var newTeamHost = fullnameFilter(updatedTeam.hostTeamMember);
      var message = $translate.instant('change_team_host_success_text', { 'newTeamHost': newTeamHost });
      NotificationService.success(message);

      // Re-init view with updated team:
      _applyTeamToView(updatedTeam);
    }

    function _applyLoadingTeamError() {
      vm.loadingTeamFailed = true;
    }

    function _isTeamHostChanged() {
      return vm.currentHostTeamMemberId !== vm.changeTeamHostRequest.newHostingTeamMemberId;
    }

  }

})(angular);
