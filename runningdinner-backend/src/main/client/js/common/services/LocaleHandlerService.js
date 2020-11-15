(function(angular) {
  'use strict';

  angular.module('rd.common.services').service('LocaleHandlerService', LocaleHandlerService);

  function LocaleHandlerService($translate, $filter, $location, tmhDynamicLocale, _) {

    var LOCAL_DATE_FORMATS = {
      "en": "yyyy-MM-dd",
      "de": "dd.MM.yyyy"
    };
    var LOCAL_DATE_TIME_FORMATS = {
      "en": "yyyy-MM-dd HH:mm",
      "de": "dd.MM.yyyy HH:mm"
    };
    var LOCAL_DATE_TIME_SECONDS_FORMATS = {
      "en": "yyyy-MM-dd HH:mm:ss",
      "de": "dd.MM.yyyy HH:mm:ss"
    };

    return {
      getCurrentLanguage: getCurrentLanguageImpl,
      changeCurrentLanguage: changeCurrentLanguageImpl,
      setCurrentLanguageFromRunningDinner: setCurrentLanguageFromRunningDinnerImpl,

      formatLocalDate: formatLocalDateImpl,
      formatLocalDateTime: formatLocalDateTimeImpl,
      formatLocalDateTimeSeconds: formatLocalDateTimeSecondsImpl,
      getLanguageSpecificDateFormat: getLanguageSpecificDateFormatImpl,
      changeAngularLocaleToCurrentLanguage: changeAngularLocaleToCurrentLanguageImpl
    };

    function getCurrentLanguageImpl() {

      if ($location.search().lang && $location.search().lang.length > 0) {
        var languageFromUrlParam = _.lowerCase($location.search().lang);
        if (languageFromUrlParam === 'en' || languageFromUrlParam === 'de') {
          $location.search('lang', null);
          $translate.use(languageFromUrlParam);
          return languageFromUrlParam;
        }
      }

      var result = $translate.use();
      if (!result) {
        result = 'de'; // Fallback
      }
      return result;
    }

    function setCurrentLanguageFromRunningDinnerImpl(runningDinner) {
      if (runningDinner && runningDinner.languageCode) {
        changeCurrentLanguageImpl(runningDinner.languageCode);
      }
    }

    function changeCurrentLanguageImpl(locale) {
      $translate.use(locale);
      tmhDynamicLocale.set(locale);
    }

    function formatLocalDateImpl(dateObj) {
      var format = getLanguageSpecificDateFormatImpl();
      return $filter('date')(dateObj, format);
    }

    function formatLocalDateTimeImpl(dateObj) {
      var format = _getLanguageSpecificDateTimeFormat();
      return $filter('date')(dateObj, format);
    }

    function formatLocalDateTimeSecondsImpl(dateObj) {
      var format = _getLanguageSpecificDateTimeSecondsFormat();
      return $filter('date')(dateObj, format);
    }

    function getLanguageSpecificDateFormatImpl() {
      var currentLocale = getCurrentLanguageImpl();
      return LOCAL_DATE_FORMATS[currentLocale];
    }

    function changeAngularLocaleToCurrentLanguageImpl() {
      var currentLocale = getCurrentLanguageImpl();
      tmhDynamicLocale.set(currentLocale);
    }

    function _getLanguageSpecificDateTimeFormat() {
      var currentLocale = getCurrentLanguageImpl();
      return LOCAL_DATE_TIME_FORMATS[currentLocale];
    }

    function _getLanguageSpecificDateTimeSecondsFormat() {
      var currentLocale = getCurrentLanguageImpl();
      return LOCAL_DATE_TIME_SECONDS_FORMATS[currentLocale];
    }

  }

})(angular);
