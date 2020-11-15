(function(angular) {
  'use strict';

  angular.module('rd.common.services').factory('EventHandlerService', EventHandlerService);

  function EventHandlerService($rootScope, $log) {

    return {
      publishMessagesSentEvent: publishMessagesSentEventImpl,
      onMessagesSentEvent: onMessagesSentEventImpl
    };

    function publishMessagesSentEventImpl(messageJob) {
      $log.info('Broadcasted messagesSentEvent Event!');
      $rootScope.$broadcast('messagesSentEvent', messageJob);
    }

    function onMessagesSentEventImpl(scope, handler) {
      scope.$on('messagesSentEvent', function (event, data) {
        $log.info('Received messagesSentEvent Event!');
        handler(data);
      });
    }

  }

})(angular);
