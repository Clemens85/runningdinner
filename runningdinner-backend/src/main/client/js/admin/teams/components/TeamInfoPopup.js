(function(angular) {
  'use strict';

  angular.module('rd.admin.components').directive('teamInfoPopup', teamInfoPopup);

  function teamInfoPopup($translate, TeamService, jQuery, fullnameFilter) {

    return {
      restrict: 'A',

      link: function (scope, element, attrs) {

        var teamNumber = attrs.teamNumber;

        jQuery(element).popover({
          content: renderTeamInfo(),
          trigger: 'focus',
          placement: 'top',
          html: 'true',
          container: 'body'
        });

        function findTeam() {
          for (var i=0; i<scope.scheduleItems.length; i++) {
            var scheduleItem = scope.scheduleItems[i];
            if (_isEqual(scheduleItem.hostTeam, teamNumber)) {
              return scheduleItem.hostTeam;
            }

            var teamsToSearch = scheduleItem.current === false ? scheduleItem.otherGuestTeams : scheduleItem.guestTeams;
            for (var j=0; j<teamsToSearch.length; j++) {
              if (_isEqual(teamsToSearch[j], teamNumber)) {
                return teamsToSearch[j];
              }
            }
          }
          return null;
        }

        function renderTeamInfo() {

          if (!teamNumber) {
            return;
          }
          var team = findTeam(teamNumber);
          if (!team) {
            return;
          }

          var teamHeadline = '<h3>' + $translate.instant('team', { teamNumber: teamNumber }) + '</h3>';
          var teamMeal = '<div>' +  team.meal.label + '</div>';

          var teamMembers = '<div style="margin-top:5px;">';
          for (var i=0; i<team.teamMembers.length; i++) {
            teamMembers += '<div>' + fullnameFilter(team.teamMembers[i]) + '</div>';
          }
          teamMembers += '</div>';

          var jumpLink = '<div style="margin-top:5px;">' +
              '<a tabindex="1" class="actionlink" href="' + TeamService.getTeamDetailsUrl(team) + '">' +
              $translate.instant('team_jump_link', { teamNumber: teamNumber })
              + '</a></div>';

          return teamHeadline + teamMeal + teamMembers + jumpLink;
        }

        function _isEqual(team, teamNumber) {
          return team.teamNumber+"" === teamNumber+"";
        }

      } // end link function

    };

  }

})(angular);
