(function(angular) {
  'use strict';

  angular.module('rd.common.components').component('dinnerRoute', {
    bindings : {
      dinnerRoute: '<'
    },
    controller : DinnerRouteCtrl,
    templateUrl : 'common/components/dinnerroute/dinnerroute.html?v=@@buildno@@'
  });

  function DinnerRouteCtrl(NgMap, GeoCoder, $q, _, Constants) {

    var ctrl = this;
    ctrl.getAlertClass = getAlertClassImpl;
    ctrl.getHeadlineClass = getHeadlineClassImpl;

    ctrl.showTeamInfoOnMap = showTeamInfoOnMapImpl;

    ctrl.isTeamCancelled = isTeamCancelledImpl;
    ctrl.isCurrentTeam = isCurrentTeamImpl;

    ctrl.currentPositionMarkerIcon = {
      url: 'https://www.robotwoods.com/dev/misc/bluecircle.png'
    };

    ctrl.$onInit = function() {
      _activate();
    };

    function _activate() {

      ctrl.teams = ctrl.dinnerRoute.teams;
      ctrl.currentTeam = ctrl.dinnerRoute.currentTeam;
      ctrl.mealSpecificsOfGuestTeams = ctrl.dinnerRoute.mealSpecificsOfGuestTeams;

      var cnt = 1;
      angular.forEach(ctrl.teams, function(team) {
        if (!isTeamCancelledImpl(team)) {
          var address = team.hostTeamMember.streetNr + " " + team.hostTeamMember.street;
          address += ", " + team.hostTeamMember.zip + " " + team.hostTeamMember.cityName;
          team.hostMarkerPosition = address;
          team.markerIcon = _createMarkerIcon(team, cnt);
        }
        cnt++;
      });

      NgMap.getMap().then(function(map) {
        ctrl.map = map;
        _geocodeTeamAddresses();
      });
    }

    function getAlertClassImpl(team) {

      if (isCurrentTeamImpl(team)) {
        return 'dinner-route-card-current';
      }
      if (isTeamCancelledImpl(team)) {
        return 'dinner-route-card-cancelled';
      }
      return 'dinner-route-card';
    }

    function getHeadlineClassImpl(team) {
      if (isCurrentTeamImpl(team)) {
        return 'text-color-dinner-card-current';
      }
      if (isTeamCancelledImpl(team)) {
        return 'text-color-dinner-route-card-cancelled';
      }
      return 'text-color-success';
    }

    function showTeamInfoOnMapImpl(e, team) {
      ctrl.selectedTeamInfo = team;
      ctrl.map.showInfoWindow('team-map-details', 't' + team.teamNumber);
    }

    function isTeamCancelledImpl(team) {
      return team.status === Constants.TEAM_STATUS.CANCELLED;
    }

    function isCurrentTeamImpl(team) {
      return team.teamNumber === ctrl.currentTeam.teamNumber;
    }

    function _createMarkerIcon(team, markerNumber) {

      var textColor = '000000';

      var bgColor = '6db33f';
      if (isCurrentTeamImpl(team)) {
        bgColor = '999999';
      }
      var url = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter_withshadow&chld=' + markerNumber + '|' + bgColor + '|' + textColor;
      return {
        url: url
      };
    }

    function _geocodeTeamAddresses() {
      var paths = [];

      var geocodePromises = [];

      angular.forEach(ctrl.teams, function(team) {

        if (!isTeamCancelledImpl(team)) {
          var geocodePromise = GeoCoder.geocode({ address: team.hostMarkerPosition});
          geocodePromise.then(function(response) {
            if (response && response.length >= 1) {
              var firstResult = response[0];
              var location = _.get(firstResult, "geometry.location");
              if (location) {
                var lat = location.lat();
                var lng = location.lng();
                team.hostTeamMember.lat = lat;
                team.hostTeamMember.lng = lng;
              }
            }
          });
          geocodePromises.push(geocodePromise);
        }
      });

      $q.all(geocodePromises).then(function() {

        var allGeocodesResolved = true;
        var cnt = 0;
        for (var i = 0; i < ctrl.teams.length; i++) {

          if (isTeamCancelledImpl(ctrl.teams[i])) {
            continue;
          }
          if (!ctrl.teams[i].hostTeamMember.lat) {
            allGeocodesResolved = false;
            break;
          }

          paths[cnt++] = [ ctrl.teams[i].hostTeamMember.lat,  ctrl.teams[i].hostTeamMember.lng ];
        }

        if (allGeocodesResolved === true) {
          ctrl.teamPaths = paths;
        }
      });

    }

  }

})(angular);
