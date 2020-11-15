(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('TeamCtrl', TeamCtrl);

  function TeamCtrl($scope, $state, $q, RunningDinnerService, TeamService, ChangeTeamHostService, NotificationService, jQuery,
                    MasterDataService, Constants, TeamCancellationViewService, dateFilter, fullnameFilter, teamNameFilter, _,
                    ActivityService, ReCreateTeamsService, UtilService, ErrorHandler, ParticipantService,
                    TeamMemberCancellationViewService, $translate, adminId) {

    var vm = this;

    vm.openTeamDetails = openTeamDetails;
    vm.showTeamDetails = showTeamDetails;

    vm.refreshTeams = refreshTeams;
    vm.hasTeams = hasTeams;

    vm.hasGenderInformation = hasGenderInformation;
    vm.getGenderTooltip = getGenderTooltip;
    vm.getGenderClass = getGenderClass;
    vm.getGenderName = getGenderName;
    vm.getGenderNameShort = getGenderNameShort;

    vm.getNumSeatsClass = getNumSeatsClass;
    vm.hasEnoughSeats = hasEnoughSeats;
    vm.getNumSeatsText = getNumSeatsText;

    vm.openChangeTeamHostDialog = openChangeTeamHostDialog;

    vm.createTeamArrangements = createTeamArrangements;
    vm.reCreateTeams = reCreateTeams;

    vm.handleTeamCancellation = handleTeamCancellation;
    vm.isTeamCancelled = isTeamCancelled;
    vm.isTeamReplaced = isTeamReplaced;

    vm.handleTeamMemberCancellation = handleTeamMemberCancellation;
    vm.hasCancelledTeamMembers = hasCancelledTeamMembers;
    vm.getCancelledTeamMembersCountArray = getCancelledTeamMembersCountArray;

    vm.teams = [];
    vm.adminId = adminId;

    // Logic:

    _hideTeamDetails();

    _showListOnlyForSmallDevices();

    var runningDinnerPromise = RunningDinnerService.findRunningDinnerByAdminIdAsync(adminId);
    runningDinnerPromise.then(function(runningDinner) {
      vm.runningDinner = runningDinner;
      vm.numSeatsNeededForHost = RunningDinnerService.getNumSeatsNeededForHost(runningDinner);
    });

    var teamsPromise = TeamService.findTeamsAsync(adminId);
    teamsPromise
        .then(function(teams) {
          vm.teams = teams;
          return teams;
        })
        .then(_checkNoTeams);


    function hasTeams() {
      if (vm.teams && vm.teams.length > 0) {
        return true;
      }
      return false;
    }

    function hasGenderInformation(teams) {
      if (!angular.isArray(teams)) {
        teams = [teams];
      }

      for (var i = 0; i < teams.length; i++) {
        var teamMembers = teams[i].teamMembers;
        for (var j = 0; j < teamMembers.length; j++) {
          if (teamMembers[j].gender && teamMembers[j].gender !== Constants.GENDER.UNDEFINED) {
            return true;
          }
        }
      }

      return false;
    }

    function getGenderTooltip(teamMember) {
      return getGenderName(teamMember);
    }

    function getGenderClass(teamMember) {
      return MasterDataService.getGenderClass(teamMember.gender);
    }

    function getGenderName(teamMember) {
      return MasterDataService.getGenderName(teamMember.gender);
    }

    function getGenderNameShort(teamMember) {
      var genderName = MasterDataService.getGenderName(teamMember.gender);
      if (!genderName) {
        return null;
      }
      if (_.startsWith(genderName.toUpperCase(), 'M')) {
        return "m";
      }
      return "w";
    }

    function getNumSeatsClass(teamMember) {
      return ParticipantService.getNumSeatsClass(teamMember, vm.numSeatsNeededForHost);
    }

    function hasEnoughSeats(team) {
      var teamMembers = team.teamMembers;
      for (var j = 0; j < teamMembers.length; j++) {
        if (teamMembers[j].numSeats && teamMembers[j].numSeats >= vm.numSeatsNeededForHost) {
          return true;
        }
      }
      return false;
    }

    function getNumSeatsText(teamMember) {
      if (teamMember.numSeats !== -1) {
        return $translate.instant("participant_seats", { 'numSeats': teamMember.numSeats });
      }
      return $translate.instant('no_information');
    }

    // if detail state change - show or hide detail section
    $scope.$watch('$state.params.teamId', function (value) {
      if (value && value.length > 0) {
        showTeamDetails(value);
      } else {
        _hideTeamDetails();
      }
    });

    $scope.$watch('$state.params.teamMemberIdToCancel', function (value) {
      if (value && value.length > 0) {
        showTeamDetails($state.params.teamId)
            .then(function() {
              var teamMember = UtilService.findEntityById(vm.activeTeamMeetingPlan.team.teamMembers, value);
              handleTeamMemberCancellation(vm.activeTeamMeetingPlan, teamMember);
            });
      }
    });

    // open details when user clicked on list item
    function openTeamDetails (team) {
      $state.go('admin.teams.details', {"teamId": team.id});
    }

    function showTeamDetails(teamId) {
      _showDetailsOnlyForSmallDevices();
      return TeamService.findTeamMeetingPlanAsync(adminId, teamId)
              .then(function (response) {
                vm.activeTeamMeetingPlan = response;
                vm.activeTeamHost = vm.activeTeamMeetingPlan.team.hostTeamMember;
                _buildMessagingUrls(vm.activeTeamMeetingPlan);
      });
    }

    function _hideTeamDetails() {
      _showListOnlyForSmallDevices();
      vm.activeTeamMeetingPlan = null;
      vm.activeTeamHost = null;
    }

    function openChangeTeamHostDialog(team) {
      ChangeTeamHostService.openChangeTeamHostDialogAsync(adminId, team, function(updatedTeam) {
        // Function is called when team host was successfully saved
        refreshTeams(updatedTeam);
        NotificationService.success('team_host_saved');
      });
    }

    function createTeamArrangements() {
      TeamService.createTeamArrangementsAsync(adminId).then(function (response) {
        vm.teams = response.teams;
      }, function (errorResponse) {
        ErrorHandler.handleProvidedIssues(_.get(errorResponse, "data.issues", []), Constants.NOTIFICATION.VALIDATION_ERROR);
      });
    }

    function reCreateTeams() {
      ActivityService.findActivitiesByAdminIdAndTypeAsync(vm.adminId, [Constants.ACTIVITY.TEAMARRANGEMENT_MAIL_SENT, Constants.ACTIVITY.DINNERROUTE_MAIL_SENT])
          .then(function(response) {
            ReCreateTeamsService.openReCreateTeamsDialogAsync(vm.adminId, response.activities).then(function(response) {
              _hideTeamDetails();
              vm.teams = response.teams;
              NotificationService.success($translate.instant('teams_reset_success_text'));
            }, function (errorResponse) {
              ErrorHandler.handleProvidedIssues(_.get(errorResponse, "data.issues", []), Constants.NOTIFICATION.VALIDATION_ERROR);
            });
          });
    }

    function refreshTeams(updatedTeams) {
      if (!angular.isArray(updatedTeams)) {
        updatedTeams = [updatedTeams];
      }
      angular.forEach(updatedTeams, function(updatedTeam) {
        TeamService.replaceTeamInList(updatedTeam, vm.teams);
        // Also replace currently selected team (if it is affected by the swap) to reflect the new team member(s):
        if (vm.activeTeamMeetingPlan != null && UtilService.isSameEntity(vm.activeTeamMeetingPlan.team, updatedTeam)) {
          vm.activeTeamMeetingPlan.team = updatedTeam;
        }
      });
      _showListOnlyForSmallDevices();
    }

    function isTeamCancelled(team) {
      return team.status === Constants.TEAM_STATUS.CANCELLED;
    }

    function isTeamReplaced(team) {
      return team.status === Constants.TEAM_STATUS.REPLACED;
    }

    function handleTeamCancellation(activeTeamMeetingPlan) {
      var team = activeTeamMeetingPlan.team;
      TeamCancellationViewService.openTeamCancellationDialogAsync(team, vm.runningDinner).then(function(teamCancellationResult) {
        refreshTeams(teamCancellationResult.team); // Update view
        var cancelledOrReplacedTeam = teamCancellationResult.team;
        if (cancelledOrReplacedTeam.status === Constants.TEAM_STATUS.REPLACED) {
          var msg = $translate.instant('team_cancel_replace_team_members_success', { cancelledOrReplacedTeam: teamNameFilter(cancelledOrReplacedTeam) });
          NotificationService.success(msg);
        } else if (cancelledOrReplacedTeam.status === Constants.TEAM_STATUS.CANCELLED) {
          var notificationMsg = $translate.instant('team_cancel_success', { cancelledOrReplacedTeam: teamNameFilter(cancelledOrReplacedTeam) });
          NotificationService.success(notificationMsg);
        }
      });
    }

    function handleTeamMemberCancellation(activeTeamMeetingPlan, teamMember) {
      return TeamMemberCancellationViewService.openTeamMemberCancellationDialogAsync(activeTeamMeetingPlan.team, teamMember, adminId)
                .then(function(updatedTeam) {
                  refreshTeams(updatedTeam);
                  var notificationMsg = $translate.instant('team_cancel_member_success_text', { fullname: fullnameFilter(teamMember) });
                  NotificationService.success(notificationMsg);
                }, function(dismissResponse) {
                  if (TeamMemberCancellationViewService.isDismissedForTeamCancellation(dismissResponse)) {
                    return handleTeamCancellation(activeTeamMeetingPlan);
                  }
                });
    }

    function hasCancelledTeamMembers(team) {
      return getCancelledTeamMembersCountArray(team).length > 0;
    }

    function getCancelledTeamMembersCountArray(team) {
      var result = [];
      if (!team || !vm.runningDinner) {
        return result;
      }
      var cnt = 1;
      for (var i = team.teamMembers.length; i < vm.runningDinner.options.teamSize; i++) {
        result.push(cnt++);
      }
      return result;
    }

    function _buildMessagingUrls(teamMeetingPlan) {
      var team = teamMeetingPlan.team;
      if (isTeamCancelled(team)) {
        var selectedTeamIds = TeamService.getHostAndGuestTeamIds(teamMeetingPlan);
        selectedTeamIds = selectedTeamIds.join(',');
        teamMeetingPlan.cancellationMessageUrlAffectedTeams = $state.href('admin.mails-teams.arrangements', {
          "adminId": adminId, 'selectedTeamIds': selectedTeamIds, "headline": 'cancellation'
        });
      } else {
        teamMeetingPlan.messageUrl = $state.href('admin.mails-teams.arrangements', {
          "adminId": adminId, "selectedTeamIds": team.id, "headline": 'custom'
        });
      }
    }

    function _checkNoTeams(foundTeams) {
      if (foundTeams && foundTeams.length > 0) {
        return;
      }

      var participantsPromise = ParticipantService.findParticipantsAsync(adminId);

      $q.all([participantsPromise, runningDinnerPromise]).then(function(responseArr) {
        var participants = responseArr[0];
        var runningDinner = responseArr[1];

        vm.noTeams = TeamService.createNoTeamsInfo(participants, runningDinner);
      });
    }

    function _showListOnlyForSmallDevices() {
      vm.hideDetailsForSmallDevicesClass = 'hidden-xs hidden-sm';
      vm.hideListForSmallDevicesClass = '';
    }

    function _showDetailsOnlyForSmallDevices() {
      vm.hideDetailsForSmallDevicesClass = '';
      vm.hideListForSmallDevicesClass = 'hidden-xs hidden-sm';
    }

    // *********** Drag n Drop Handling: ***************** //
    $scope.onTeamMemberDropped = function (event, srcElementArr) {

      var srcElement = angular.element(srcElementArr.draggable);

      var srcTeamId = srcElement.attr('parent-team');
      var destTeamId = this.$parent.team.id;

      var srcTeamMember = this.dndDragItem;
      var destTeamMember = this.teamMember;

      TeamService.swapTeamMembersAsync(adminId, srcTeamMember.id, destTeamMember.id).then(function (response) {
        refreshTeams(response.teams);
        var notificationMsg = $translate.instant('team_swap_success_text', { fullnameSrc: fullnameFilter(srcTeamMember), fullnameDest: fullnameFilter(destTeamMember) });
        NotificationService.success(notificationMsg);
      }).catch(function (errorResponse) {
        _revertTeamMemberSwap(srcTeamId, srcTeamMember, destTeamId, destTeamMember);
        if (ErrorHandler.isValidationErrorResponse(errorResponse)) {
          ErrorHandler.handleProvidedIssues(_.get(errorResponse, "data.issues", []), Constants.NOTIFICATION.VALIDATION_ERROR);
        }
      });
    };

    function _revertTeamMemberSwap(srcTeamId, srcTeamMember, destTeamId, destTeamMember) {
      var srcTeam = UtilService.findEntityById(vm.teams, srcTeamId);
      var destTeam = UtilService.findEntityById(vm.teams, destTeamId);

      TeamService.replaceTeamMember(srcTeam, destTeamMember, srcTeamMember);
      TeamService.replaceTeamMember(destTeam, srcTeamMember, destTeamMember);

      TeamService.replaceTeamInList(srcTeam, vm.teams);
      TeamService.replaceTeamInList(destTeam, vm.teams);
    }

    $scope.onStartDrag = function (event, ui, title) {
      jQuery('.draggableTeamMember').addClass('draggableTeamMemberBordered');

      // Current dragging element shall not be bordered:
      var draggedTeamMember = angular.element(event.currentTarget);
      jQuery(draggedTeamMember).removeClass('draggableTeamMemberBordered');
    };

    $scope.onStopDrag = function (event, ui) {
      jQuery('.draggableTeamMember').removeClass('draggableTeamMemberBordered');
    };

    $scope.onOverTeamMember = function (event, ui) {
      this.teamMember.dropOver = true;
    };

    $scope.onLeavingTeamMember = function (event, ui) {
      this.teamMember.dropOver = false;
    };
  }

})(angular);
