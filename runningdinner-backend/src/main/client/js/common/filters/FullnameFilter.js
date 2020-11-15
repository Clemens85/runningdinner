(function(angular) {
  'use strict';

  angular.module('rd.common.filters').filter('fullname', FullnameFilter);

  function FullnameFilter() {

    return function(incomingObject) {
      if (angular.isArray(incomingObject)) {
        return _getParticipantNames(incomingObject);
      } else {
        return _getFullname(incomingObject);
      }
    };


    function _getParticipantNames(participants) {
      var result = '';
      for (var i = 0; i < participants.length; i++) {
        if (i > 0) {
          result += ', ';
        }
        var participantFullname = _getFullname(participants[i]);
        result += participantFullname;
      }
      return result;
    }

    function _getFullname(participant) {
      if (participant) {
        var firstnamePart = participant.firstnamePart || '';
        var lastname = participant.lastname || '';
        var result = firstnamePart + ' ' + lastname;
        return result.trim();
      }
      return '';
    }
  }

})(angular);

