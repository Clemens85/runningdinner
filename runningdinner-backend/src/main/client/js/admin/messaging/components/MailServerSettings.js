(function(angular) {
  'use strict';

  angular.module('rd.admin.components').directive('mailServerSettings', mailServerSettings);

  function mailServerSettings($uibModal, MessageService, NotificationService, Constants) {

    return {
      restrict: 'E',
      replace: 'true',
      scope: {
        adminId: '@'
      },
      templateUrl: 'admin/messaging/components/mailserversettings.html',

      link: function (scope, element, attrs) {

        scope.customMailServerSettings = {
          useCustomMailServer: false,
          mailServerSettings: {}
        };

        MessageService.loadCustomMailServerSettings(scope.adminId).then(function (response) {
          scope.customMailServerSettings = response;
          var mailServerType = Constants.MAIL_SERVER_TYPE.STANDARD;
          if (scope.customMailServerSettings.useCustomMailServer) {
            mailServerType = Constants.MAIL_SERVER_TYPE.CUSTOM;
          }
          scope.setMailServerType(mailServerType);
        });

        scope.setMailServerType = function (mailServerType) {
          scope.mailServerType = mailServerType;
        };

        scope.getMailServerTypeClass = function (mailServerType) {
          if (mailServerType === scope.mailServerType) {
            return "btn-success";
          }
          return "btn-default";
        };

        scope.isCustomMailServerType = function () {
          return scope.mailServerType === Constants.MAIL_SERVER_TYPE.CUSTOM;
        };

        scope.openMailServerSettingsDialog = function () {
          var modalInstance = $uibModal.open({
            templateUrl: 'admin/messaging/components/mailserversettingsdialog.html',
            controller: 'MailServerSettingsModalCtrl',
            resolve: {
              mailServerSettings: function () {
                return scope.customMailServerSettings.mailServerSettings;
              },
              adminId: function () {
                return scope.adminId;
              }
            }
          });

          modalInstance.result.then(function (mailServerSettings) {
            scope.customMailServerSettings.mailServerSettings = mailServerSettings;
            NotificationService.success('mails_mailserver_settings_save_cookie_success');
          }, function () {
            // User hit cancel
          });
        };
      } // end link function
    };

  }

}(angular));
