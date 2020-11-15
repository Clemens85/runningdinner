(function(angular) {
  'use strict';

  angular.module('rd.common.components').component('languageSwitch', {
    bindings : {
      onChangeLanguage: '<',
      currentLanguage: '<'
    },
    template :
        "<div style='line-height: 48px;'>\n" +
        "  <div class=\"btn-group margin-right-medium\" role=\"group\" aria-label=\"\">\n" +
        "    <button type=\"button\" class=\"btn btn-default \" ng-class=\"{ 'btn-success': $ctrl.currentLanguage === 'de' }\"\n" +
        "            ng-click=\"$ctrl.onChangeLanguage('de')\">" +
        "                 <span class='lang-sm' lang='de'></span> <span ng-class=\"{ 'bold': $ctrl.currentLanguage === 'de' }\">DE</span>" +
        "   </button>\n" +
        "    <button type=\"button\" class=\"btn btn-default\" ng-class=\"{ 'btn-success': $ctrl.currentLanguage === 'en' }\"\n" +
        "            ng-click=\"$ctrl.onChangeLanguage('en')\">" +
        "               <span class='lang-sm' lang='en'></span> <span ng-class=\"{ 'bold': $ctrl.currentLanguage === 'en' }\">EN</span>" +
        "   </button>\n" +
        "  </div>\n" +
        "</div>"
  });

})(angular);
