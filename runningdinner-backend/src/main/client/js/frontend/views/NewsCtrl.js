(function(angular) {
  'use strict';

  angular.module('FrontendApp').controller('NewsCtrl', NewsCtrl);

  function NewsCtrl($scope, $state, BaseController, $translate, moment, _) {

    var vm = this;
    vm.items = [];

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    _activate();

    function _activate() {

      var translationKeys = $translate.getTranslationTable();

      angular.forEach(translationKeys, function(value, key) {
        if (_.startsWith(key, 'news_title_')) {
          var newsDateStr = key.substring(11);
          vm.items.push({
            title: key,
            content: 'news_content_' + newsDateStr,
            date: moment(newsDateStr, 'YYYYMMDD').toDate()
          });
        }
      });

      vm.items = _.orderBy(vm.items, 'date', ['desc']);
    }

  }

})(angular);
