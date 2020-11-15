(function(angular) {
  'use strict';

    angular.module('rd.admin.components').controller('MailServerSettingsModalCtrl', MailServerSettingsModalCtrl);

    function MailServerSettingsModalCtrl($scope, $uibModalInstance, MessageService, NotificationService,
                                         TriggerFocus, mailServerSettings, adminId) {

        $scope.ui = {
            checkingMailConnection: false
        };

        $scope.mailServerSettings = mailServerSettings;
        $scope.adminId = adminId;

        TriggerFocus("init");

        $scope.ui.save = function () {
            $scope.saveCustomMailServerSettings().then(function(result) {
                if (result === true) {
                    $uibModalInstance.close($scope.mailServerSettings);
                }
            });
        };

        $scope.ui.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.ui.checkMailConnection = function(testEmailAddress) {
            $scope.ui.checkingMailConnection = true;
            MessageService.checkMailConnection($scope.adminId, $scope.mailServerSettings, testEmailAddress).then(function(response) {
                $scope.ui.checkingMailConnection = false;
                NotificationService.success('mails_mailserver_settings_connection_test_success');
            }, function() {
                $scope.ui.checkingMailConnection = false;
            });
        };

        $scope.ui.isCheckingMailConnection = function() {
            return $scope.ui.checkingMailConnection;
        };

        $scope.saveCustomMailServerSettings = function() {
            return MessageService.saveCustomMailServerSettings($scope.adminId, $scope.mailServerSettings).then(function(response) {
                return true;
            }, function (errorResponse) {
                return false;
            });
        };

    }

}(angular));
