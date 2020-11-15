(function(angular) {
  'use strict';

    angular.module('rd.common.services').factory('HttpInterceptor', HttpInterceptor);

    function HttpInterceptor($q, $rootScope, jQuery, HttpSerializationService, _) {


        var requestInterceptor = {

          // Prevent cached results:
          "request": function (request) {
            if (request.cache !== true && !_isHtmlResource(request.url)) {
              var requestSeparatorChar = '?';
              if (_.includes(request.url, '?')) {
                requestSeparatorChar = '&';
              }
              request.url += requestSeparatorChar + '_t=' + Date.now();
            }

            if (request.data) {
              request.data = HttpSerializationService.serializeRequestData(request.data);
            }

            return request;
          },

          "response": function (response) {
            var url = _.get(response, "config.url", "") || "";
            if (_.includes(url, "/rest/") && response.data) { // Intercept only our REST API responses:
              response.data = HttpSerializationService.deserializeResponseData(response.data);
            }
            return response;
          },

          "responseError": function (response) {
            var httpStatus = response.status;

            if (jQuery.inArray(httpStatus, response.config.ignoreErrorCodes) < 0) {
                if (httpStatus === 401) {
                    // Maybe perform special handling in future
                } else if (httpStatus === 0) {
                    // request aborted => do nothing
                } else if (httpStatus === 400 || httpStatus === 404 || httpStatus === 406 || httpStatus === 424 || httpStatus === 500 || httpStatus === 415) {
                    $rootScope.$emit(""+httpStatus, response);
                } else {

                }
            }

            return $q.reject(response);
          }
        };

        function _isHtmlResource(url) {

          return _.includes(url, '.html');
        }

        return requestInterceptor;

    }

})(angular);
