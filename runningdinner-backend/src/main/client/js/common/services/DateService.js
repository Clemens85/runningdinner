(function(angular) {
  'use strict';

  angular.module('rd.common.services').factory('DateService', DateService);

  function DateService($filter, moment, _) {

    return {
      getDaysBetweenDates: getDaysBetweenDatesImpl,

      serializeLocalDateToArray: serializeLocalDateToArrayImpl,
      serializeLocalDateTimeToArray: serializeLocalDateTimeToArrayImpl,

      deserializeArrayToLocalDateTime: deserializeArrayToLocalDateTimeImpl,

      serializeLocalDateToQueryParameter: serializeLocalDateToQueryParameterImpl
    };

    function getDaysBetweenDatesImpl(firstDate, secondDate) {
      var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
      var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
      return diffDays;
    }

    /**
     * Takes a JS date and transforms it to an array containg only the date (without time). Array looks like following:
     * [2016, 10, 31]
     *
     * @param date
     */
    function serializeLocalDateToArrayImpl(incomingDate) {
      if (!incomingDate) {
        return null;
      }
      if (angular.isArray(incomingDate) && incomingDate.length === 3) {
        // Ensure that method can be called multiple times (even with already converted array object):
        return incomingDate;
      }
      return _serializeDateToArray(incomingDate, false);
    }

    function serializeLocalDateTimeToArrayImpl(incomingDateTime) {
      if (!incomingDateTime) {
        return null;
      }
      if (angular.isArray(incomingDateTime) && incomingDateTime.length === 6) {
        // Ensure that method can be called multiple times (even with already converted array object):
        return incomingDateTime;
      }
      return _serializeDateToArray(incomingDateTime, true);
    }

    function _serializeDateToArray(incomingDate, includeTime) {
      var dateAsMoment = moment(incomingDate);
      var month = dateAsMoment.month() + 1; //months from 1-12
      var day = dateAsMoment.date();
      var year = dateAsMoment.year();

      var result = [year, month, day];
      if (includeTime) {
        var hour = dateAsMoment.hour();
        var minute = dateAsMoment.minute();
        var second = dateAsMoment.second();
        result = result.concat([hour, minute, second]);
      }
      return result;
    }

    function _deserializeArrayToLocalDateImpl(localDateArr) {

      if (!localDateArr) {
        return null;
      }

      if (!angular.isArray(localDateArr) || localDateArr.length !== 3) {
        return localDateArr;
      }

      var dateStr = _.join(localDateArr, ",");
      var dateAsMoment = moment(dateStr, "YYYY,MM,DD");
      return dateAsMoment.toDate();
    }

    function deserializeArrayToLocalDateTimeImpl(localDateTimeArr) {

      if (!localDateTimeArr) {
        return null;
      }

      if (!angular.isArray(localDateTimeArr) || localDateTimeArr.length < 3) {
        return localDateTimeArr;
      }

      var localDateArr = _.slice(localDateTimeArr, 0, 3);
      var result = _deserializeArrayToLocalDateImpl(localDateArr);

      var cnt = 0;
      for (var i = 3; i < localDateTimeArr.length; i++) {
        var timeAmount = localDateTimeArr[i];
        if (cnt === 0) {
          result.setHours(timeAmount);
        } else if (cnt === 1) {
          result.setMinutes(timeAmount);
        } else if (cnt === 2) {
          result.setSeconds(timeAmount);
        } else {
          break;
        }
        cnt++;
      }

      return result;
    }

    function serializeLocalDateToQueryParameterImpl(localDate) {
      if (!localDate) {
        return '';
      }
      return $filter('date')(localDate, 'yyyy-MM-dd');
    }
  }

})(angular);
