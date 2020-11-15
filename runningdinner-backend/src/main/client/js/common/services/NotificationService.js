(function(angular) {
  'use strict';

    angular.module('rd.common.services')
        .factory('NotificationService', NotificationService);

    function NotificationService(toastr, $translate, Constants, _) {

      var options = {
        allowHtml: true,
        closeButton: true,
        // closeHtml: '<button></button>',
        // containerId: 'toast-container',
        extendedTimeOut: 3000,
        tapToDismiss: false,
        timeOut: 3000,
        positionClass: 'main-toast-top-center',
        toastClass: 'toast main-toast'
      };

      var errorOptions = {
        allowHtml: true,
        closeButton: true,
        // closeHtml: '<button></button>',
        tapToDismiss: false,
        timeOut: 0,
        extendedTimeOut: 0,
        positionClass: 'main-toast-top-center',
        toastClass: 'toast main-toast'
      };

      var toastMap = {};

      return {
        success: successImpl,
        error: errorImpl,
        remove: removeImpl,
        removeAll: removeAllImpl,
        hasNotificationWithNameInHierarchy: hasNotificationWithNameInHierarchyImpl
      };

      function successImpl(message) {
        if (message) {
          message = $translate.instant(message);
        }
        toastMap[Constants.NOTIFICATION.SUCCESS] = toastr.success(message, '', options);
      }

      function errorImpl(message, notificationType) {
        if (message) {
          message = $translate.instant(message);
        }
        toastMap[notificationType] = toastr.error(message, '', errorOptions);
        return notificationType;
      }

      function removeImpl(notificationName) {
        var toastToRemove = toastMap[notificationName];
        if (toastToRemove) {
          toastr.remove(toastToRemove.toastId);
        }
      }

      function removeAllImpl() {

        var notificationNames = Object.keys(toastMap);
        for (var i = 0; i < notificationNames.length; i++) {
          var notificationName = notificationNames[i];
          if (!notificationName || notificationName.length <= 0) {
            continue;
          }
          removeImpl(notificationName);
        }
      }

      function hasNotificationWithNameInHierarchyImpl(notificationName) {

        var existingNotificationNames = Object.keys(toastMap);
        if (!existingNotificationNames) {
          return false;
        }
        for (var i = 0; i < existingNotificationNames.length; i++) {
          var existingNotificationName = existingNotificationNames[i];
          if (existingNotificationName === notificationName) {
            return true;
          }
          if (_.includes(existingNotificationName, notificationName) || _.includes(notificationName, existingNotificationName)) {
            return true;
          }
        }
        return false;
      }

    }

})(angular);
