(function(angular) {
  'use strict';

  angular.module('rd.common.services').service('RestClientService', RestClientService);

  function RestClientService($http, $q, $timeout) {

    /**
     * Executes a request based on the given configuration (JSON object passed to $http service).
     * To add dynamic data to the request, the values object can be used to set path parameters,
     * query parameters or request payload (data):
     *
     * Example 1:
     *
     * HttpClient.execute({
       *   "url": '/contact/:contactId',
       *   "method": 'get'
       * }, {
       *   "pathParams": {
       *     "contactId": 123
       *   },
       *   "queryParams": {
       *     "version": '13'
       *   },
       *   "data": null // can also be omitted
       * });
     *
     * => Result: GET Request to url '/contacts/123?version=13'
     *
     * Example 2:
     *
     * HttpClient.execute({
       *   "url": '/contact',
       *   "method": 'put'
       * }, {
       *   "pathParams": null, // can also be omitted
       *   "queryParams": null, // can also be omitted
       *   "data": {
       *     "firstName": 'Frank',
       *     "lastName": 'Maier'
       *   }
       * });
     *
     * => Result: PUT Request to url '/contact'
     *
     * See also HttpClient.spec.js
     */
    this.execute = function (originalRequestConfig, values, returnOriginalResponse) {

      var origResponse = (returnOriginalResponse === true) ? true : false;

      var requestConfig = angular.copy(originalRequestConfig);

      var data = null, pathParams = null, queryParams = null;

      if (values != null) {
        data = values.data;
        pathParams = values.pathParams;
        queryParams = values.queryParams;
      }

      /*****************************************************
       * replace placeholders in url
       *****************************************************/
      if (pathParams != null) {
        var url = requestConfig.url;

        for (var placeholderName in pathParams) {
          var regex = new RegExp(':' + placeholderName, 'g');
          var value = null;

          if (angular.isFunction(pathParams[placeholderName])) {
            value = pathParams[placeholderName].call(null);
          } else {
            value = pathParams[placeholderName];
          }

          url = url.replace(regex, encodeURIComponent(value));
        }

        requestConfig.url = url;
      }

      /*****************************************************
       * resolve query string params
       *****************************************************/

      if (queryParams != null) {
        var resolvedQueryParams = {};

        for (var queryParamName in queryParams) {
          var queryParamValue = null;

          if (angular.isFunction(queryParams[queryParamName])) {
            queryParamValue = queryParams[queryParamName].call(null);
          } else {
            queryParamValue = queryParams[queryParamName];
          }
          resolvedQueryParams[queryParamName] = queryParamValue;
        }

        requestConfig.params = angular.extend(requestConfig.params || {}, resolvedQueryParams);
      }

      /*****************************************************
       * set data in request config
       *****************************************************/

      if (data != null) {
        var resolvedData = null;

        if (angular.isFunction(data)) {
          resolvedData = data.call(null);
        } else {
          resolvedData = data;
        }

        requestConfig.data = resolvedData;
      }

      /*****************************************************
       * execute request
       *****************************************************/
      var promise = $http(requestConfig).then(function (response) {
        return origResponse ? response : response.data;
      });

      /**/

      return promise;
    };

  }

})(angular);
