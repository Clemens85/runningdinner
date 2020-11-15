(function(angular) {
  'use strict';

  angular.module('rd.common.services').factory('UtilService', UtilService);

  function UtilService(_) {

    return {
      isSameEntity: isSameEntityImpl,
      findEntityById: findEntityByIdImpl,
      replaceEntityById: replaceEntityByIdImpl,
      isNewEntity: isNewEntityImpl,

      isPositiveInteger: isPositiveIntegerImpl,
      isNotEmptyString: isNotEmptyStringImpl,

      mapNewLineToHtmlLineBreaks: mapNewLineToHtmlLineBreaksImpl,

      replaceAll: replaceAllImpl,

      getTruncatedText: getTruncatedTextImpl,

      appendUrlQueryParams: appendUrlQueryParamsImpl
    };

    function isSameEntityImpl(entity1, entity2) {
      if (entity1 && entity2 && entity1.id === entity2.id) {
        return true;
      }
      return false;
    }


    function isNewEntityImpl(entity) {

      var id = _.get(entity, "id", null);
      if (!id) {
        return true;
      }
      var len = id.length;
      return !len || len <= 0;
    }

    /**
     * Iterates the passed list and tries to find the entity with the passed id.
     * @param entities
     * @param id
     * @returns {*} the found entity or null
     */
    function findEntityByIdImpl(entities, id) {

      var result =_.filter(entities, { 'id': id });
      if (!result || result.length !== 1) {
        return null;
      }
      return result[0];
    }

    function replaceEntityByIdImpl(entityArr, updatedEntity) {

      if (!updatedEntity) {
        return -1;
      }

      for (var i = 0; i < entityArr.length; i++) {
        if (isSameEntityImpl(entityArr[i], updatedEntity)) {
          entityArr[i] = updatedEntity;
          return i;
        }
      }
      return -1;
    }

    function isPositiveIntegerImpl(str) {
      return /^\+?(0|[1-9]\d*)$/.test(str);
    }

    function mapNewLineToHtmlLineBreaksImpl(str) {
      return str.replace(new RegExp('\r?\n','g'), '<br />');
    }

    function replaceAllImpl(str, target, replacement) {
      return str.split(target).join(replacement);
    }

    function getTruncatedTextImpl(text, limit) {
      if (!text) {
        return "";
      }
      if (text.length <= limit || limit <= 4) {
        return text;
      }

      var result = _.truncate(text, { length: limit });
      return result;
    }

    function appendUrlQueryParamsImpl(url, queryParams) {

      var resultUrl = url;
      if (_.endsWith(resultUrl, '?') || _.endsWith(resultUrl, '&')) {
        resultUrl = resultUrl.slice(0, -1); // chop last char
      }

      var querySeparatorChar = '?';
      if (resultUrl.indexOf('?') !== -1) {
        querySeparatorChar = '&';
      }

      return resultUrl + querySeparatorChar + queryParams;
    }

    function isNotEmptyStringImpl(str) {
      return str && str.length > 0;
    }
  }

})(angular);
