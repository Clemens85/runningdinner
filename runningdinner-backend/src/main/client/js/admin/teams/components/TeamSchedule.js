(function(angular) {
  'use strict';

  angular.module('rd.admin.components').directive('teamSchedule', teamSchedule);

  function teamSchedule(orderByFilter, Constants) {

    function convertToScheduleItems(teamMeetingPlan) {

      var result = [];

      var currentTeamScheduleItem = {
        meal: teamMeetingPlan.team.meal,
        hostTeam: teamMeetingPlan.team,
        guestTeams: teamMeetingPlan.guestTeams,
        current: true
      };
      result.push(currentTeamScheduleItem);

      var otherHostTeams = teamMeetingPlan.hostTeams;
      for (var i=0; i<otherHostTeams.length; i++) {
        var otherHostTeam = otherHostTeams[i];
        var scheduleItem = {
          meal: otherHostTeam.meal,
          hostTeam: otherHostTeam,
          currentGuestTeam: currentTeamScheduleItem.hostTeam,
          otherGuestTeams: otherHostTeam.meetedTeams,
          current: false
        };
        result.push(scheduleItem);
      }

      result = orderByFilter(result, 'meal.time');
      return result;
    }

    return {
      restrict: 'E',
      replace: 'true',
      scope : {
        teamMeetingPlan : '=',
        onTeamClick : '&'
      },
      templateUrl: 'admin/teams/components/teamschedule.html?v=@@buildno@@',

      link: function (scope, element, attrs) {

        scope.$watch('teamMeetingPlan', function(value) {
          if (value) {
            scope.scheduleItems = convertToScheduleItems(value);
          }
        });

        scope.isTeamCancelled = function(team) {
          return team.status === Constants.TEAM_STATUS.CANCELLED;
        };

      } // end link function

    };

  }

})(angular);
