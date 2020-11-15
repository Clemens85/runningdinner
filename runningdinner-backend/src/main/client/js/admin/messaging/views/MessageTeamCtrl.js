(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('MessageTeamCtrl', MessageTeamCtrl);

  function MessageTeamCtrl($translate, $state, TeamService, MessageService, MailPreviewService, _, Constants, $timeout, FormValidationService,
                           CustomSelectionService, EventHandlerService, UtilService, TriggerFocus, teamNameMembersFilter, $scope, adminId) {

    var FORM_NAMES = [];
    FORM_NAMES[Constants.MESSAGE_TYPE.TEAM] = "ctrl.teamMessageForm";
    FORM_NAMES[Constants.MESSAGE_TYPE.DINNER_ROUTE] = "ctrl.dinnerRouteMessageForm";

    var vm = this;
    vm.sendMails = sendMails;
    vm.previewMails = previewMails;

    vm.openCustomSelectionDialog = openCustomSelectionDialog;
    vm.isAllTeamsSelected = isAllTeamsSelected;

    vm.teamMessage = {
      message: $translate.instant('mails_template_sendteams_message'),
      subject: '',
      hostMessagePartTemplate: $translate.instant('mails_template_sendteams_host'),
      nonHostMessagePartTemplate: $translate.instant('mails_template_sendteams_nonhost')
    };

    vm.dinnerRouteMessage = {
      message: $translate.instant('mails_template_senddinnerroute_message'),
      subject: '',
      selfTemplate: $translate.instant('mails_template_senddinnerroute_self'),
      hostsTemplate: $translate.instant('mails_template_senddinnerroute_hosts')
    };

    vm.teamSelectionChoices = [
      { value: Constants.PARTICIPANT_SELECTION.ALL, label: $translate.instant('team_selection_all') },
      { value: Constants.PARTICIPANT_SELECTION.CUSTOM_SELECTION, label: $translate.instant('team_selection_single_selection') }
    ];

    vm.teams = [];

    vm.adminId = adminId;
    vm.messageType = $state.current.data.messageType; // passed from router config

    vm.customSelectedTeams = [];

    _activate();

    function _activate() {
      TriggerFocus('init');

      if (vm.messageType === Constants.MESSAGE_TYPE.TEAM) {
        var passedHeadlineType = $state.params.headline || '';
        if (passedHeadlineType === 'cancellation') {
          vm.headline = $translate.instant('team_cancellation_message_headline');
        } else if (passedHeadlineType === 'custom') {
          vm.headline = $translate.instant('team_single_message_headline');
        } else {
          vm.headline = $translate.instant('mails_team_sendmessage_headline');
        }
      } else {
        vm.headline = $translate.instant('mails_senddinnerroute_sendmessage');
      }

      TeamService.findTeamsNotCancelledAsync(adminId).then(function (teams) {
        vm.teams = teams;
        return teams;
      }).then(function(teams) {
        _selectTeamIdsFromStateParams(teams, $state.params.selectedTeamIds);
      }).finally(function() {
        $timeout(_watchSelectionChoice);
      });
    }

    function openCustomSelectionDialog() {
      return CustomSelectionService
              .openCustomEntitySelectionDialogAsync(vm.teams, vm.customSelectedTeams, teamNameMembersFilter)
              .then(function(newSelectedTeams) {
                vm.customSelectedTeams = newSelectedTeams;
                if (vm.customSelectedTeams.length === 0) {
                  _setTeamSelectionValue(null); // Remove selection
                }
                return newSelectedTeams;
              });
    }

    function _watchSelectionChoice() {
      $scope.$watch(function() {
        return _getTeamSelectionValue();
      }, _onSelectionChoiceChanged);
    }

    function _onSelectionChoiceChanged(newValue, oldValue) {
      if (newValue === Constants.TEAM_SELECTION.ALL) {
        vm.customSelectedTeams = [];
      } else if (newValue === Constants.TEAM_SELECTION.CUSTOM_SELECTION && oldValue !== Constants.TEAM_SELECTION.CUSTOM_SELECTION) {
        openCustomSelectionDialog();
      }
    }

    function sendMails() {
      _resetForm();
      return _getSendMailsPromise().then(function (createdMessageJob) {
        EventHandlerService.publishMessagesSentEvent(createdMessageJob);
      }, function (errorResponse) {
        _validateForm(errorResponse);
      });
    }

    function isAllTeamsSelected() {
      return _getTeamSelectionValue() === Constants.TEAM_SELECTION.ALL;
    }

    function _getSendMailsPromise() {
      _mapCustomSelectedTeamsToIds();
      if (vm.messageType === Constants.MESSAGE_TYPE.TEAM) {
        return MessageService.sendTeamArrangementMailsAsync(adminId, vm.teamMessage);
      } else {
        return MessageService.sendDinnerRouteMailsAsync(adminId, vm.dinnerRouteMessage);
      }
    }

    function _getTeamSelectionValue() {
      var teamOrDinnerRouteMessage = _getTeamOrDinnerRouteMessage();
      return _.get(teamOrDinnerRouteMessage, 'teamSelection', null);
    }

    function _setTeamSelectionValue(teamSelection) {
      var teamOrDinnerRouteMessage = _getTeamOrDinnerRouteMessage();
      _.set(teamOrDinnerRouteMessage, 'teamSelection', teamSelection);
    }

    function _mapCustomSelectedTeamsToIds() {
      var teamOrDinnerRouteMessage = _getTeamOrDinnerRouteMessage();
      var teamSelection = _getTeamSelectionValue();
      if (teamSelection === Constants.TEAM_SELECTION.CUSTOM_SELECTION) {
        teamOrDinnerRouteMessage.customSelectedTeamIds = _.map(vm.customSelectedTeams, "id");
      } else {
        teamOrDinnerRouteMessage.customSelectedTeamIds = [];
      }
    }

    function _getTeamOrDinnerRouteMessage() {
      if (vm.messageType === Constants.MESSAGE_TYPE.TEAM) {
        return vm.teamMessage;
      } else {
        return vm.dinnerRouteMessage;
      }
    }

    function _selectTeamIdsFromStateParams(teams, selectedTeamIdsStr) {
      if (selectedTeamIdsStr && selectedTeamIdsStr.length > 0) {
        vm.customSelectedTeams = [];
        var selectedTeamIdsArr = selectedTeamIdsStr.split(',');
        for (var i = 0; i < selectedTeamIdsArr.length; i++) {
          var selectedTeam = UtilService.findEntityById(teams, selectedTeamIdsArr[i]);
          if (selectedTeam) {
            vm.customSelectedTeams.push(selectedTeam);
          }
        }
        if (vm.customSelectedTeams.length > 0) {
          _setTeamSelectionValue(Constants.TEAM_SELECTION.CUSTOM_SELECTION);
        }
      }
    }

    function previewMails() {
      var messageObject = vm.dinnerRouteMessage;
      if (vm.messageType === Constants.MESSAGE_TYPE.TEAM) {
        messageObject = vm.teamMessage;
      }
      _resetForm();
      return MailPreviewService
              .openMailPreviewAsync(vm.adminId, vm.teams, vm.messageType, messageObject)
              .then(function() {},
                  function(errorResponse) {
                    _validateForm(errorResponse);
                  });
    }

    function _resetForm() {
      FormValidationService.resetForm(FORM_NAMES[vm.messageType]);
    }

    function _validateForm(errorResponse) {
      FormValidationService.validateForm(FORM_NAMES[vm.messageType], errorResponse);
    }

  }

}(angular));
