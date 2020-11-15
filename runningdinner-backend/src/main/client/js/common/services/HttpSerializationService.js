(function(angular) {
  'use strict';

  angular.module('rd.common.services').factory('HttpSerializationService', HttpSerializationService);

  function HttpSerializationService(DateService, _) {

    return {
      serializeRequestData: serializeRequestDataImpl,
      deserializeResponseData: deserializeResponseDataImpl,
      serializeLocalDateToQueryParameter: serializeLocalDateToQueryParameterImpl
    };

    function serializeRequestDataImpl(requestData) {
      if (!requestData) {
        return null;
      }

      var result = angular.copy(requestData);

      _serializeDateProperties(result);
      return result;
    }

    function deserializeResponseDataImpl(responseData) {
      if (!responseData) {
        return null;
      }

      if (angular.isArray(responseData)) {
        for (var i = 0; i < responseData.length; i++) {
          _deserializeDateProperties(responseData[i]);
        }
      } else {
        _deserializeDateProperties(responseData);
      }
      return responseData;
    }

    function serializeLocalDateToQueryParameterImpl(localDate) {

      return DateService.serializeLocalDateToQueryParameter(localDate);
    }

    function _serializeDateProperties(object) {

      _.forIn(object, function(value, key) {

        if (_.includes(key, 'time') || _.endsWith(key, 'Time') || key === 'activationDate' || key === 'delieveryFailedDate') {
          var dateTime = _.get(object, key);
          _.set(object, key, DateService.serializeLocalDateTimeToArray(dateTime));
        } else if (_.includes(key, 'date') || _.endsWith(key, 'Date')) {
          var date = _.get(object, key);
          _.set(object, key, DateService.serializeLocalDateToArray(date));
        } else if (_.isDate(value)) {
          _.set(object, key, DateService.serializeLocalDateTimeToArray(value));
        } else {
          if (angular.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
              _serializeDateProperties(value[i]);
            }
          } else if (_.isObjectLike(value)) {
            _serializeDateProperties(value);
          }
        }
      });
    }

    function _deserializeDateProperties(object) {

      _.forIn(object, function(value, key) {

        if (_.includes(key, 'time') ||
            _.includes(key, 'date') || _.endsWith(key, 'Date') || _.endsWith(key, 'Time') || key === 'createdAt') {
          var dateOrTime = _.get(object, key);
          _.set(object, key, DateService.deserializeArrayToLocalDateTime(dateOrTime));
        } else if (_.isObjectLike(value)) {
          _deserializeDateProperties(value);
        }
      });

    }
  }

})(angular);

