(function(angular) {
  'use strict';

    angular.module('rd.admin.services').factory('MessageService', MessageService);

    function MessageService(RestClientService, Constants, AdminRequests, $state, _) {

      return {
        loadCustomMailServerSettings: loadCustomMailServerSettingsImpl,

        saveCustomMailServerSettings: saveCustomMailServerSettingsImpl,
        checkMailConnection: checkMailConnectionImpl,

        getTeamArrangementMailPreviewAsync: getTeamArrangementMailPreviewAsyncImpl,
        sendTeamArrangementMailsAsync: sendTeamArrangementMailsAsyncImpl,

        getParticipantMailPreviewAsync: getParticipantMailPreviewAsyncImpl,
        sendParticipantMailsAsync: sendParticipantMailsAsyncImpl,

        sendTeamPartnerWishInvitationAsync: sendTeamPartnerWishInvitationAsyncImpl,

        getDinnerRouteMailPreviewAsync: getDinnerRouteMailPreviewAsyncImpl,
        sendDinnerRouteMailsAsync: sendDinnerRouteMailsAsyncImpl,

        findMessageJobsByTypeAsync: findMessageJobsByTypeAsyncImpl,
        findMessageTasksByAdminIdAndMessageJobIdAsync: findMessageTasksByAdminIdAndMessageJobIdAsyncImpl,
        findMessageJobByAdminIdAndMessageJobIdAsync: findMessageJobByAdminIdAndMessageJobIdAsyncImpl,

        findMessageJobOverviewAsync: findMessageJobOverviewAsyncImpl,

        getMessageJobUrl: getMessageJobUrlImpl,

        getStatusResult: getStatusResultImpl,

        reSendMessageTaskAsync: reSendMessageTaskAsyncImpl
      };

      function findMessageJobsByTypeAsyncImpl(adminId, messageType) {
        return RestClientService.execute(AdminRequests.findMessageJobsByAdminIdAndType, {
            "pathParams": {
              "adminId": adminId
            },
            "queryParams": {
              "messageType": messageType
            }
          }
        );
      }

      function findMessageJobByAdminIdAndMessageJobIdAsyncImpl(adminId, messageJobId) {
        return RestClientService.execute(AdminRequests.findMessageJobByAdminIdAndMessageJobId, {
              "pathParams": {
                "adminId": adminId,
                "messageJobId": messageJobId
              }
            }
        );
      }

      function findMessageJobOverviewAsyncImpl(adminId, messageJobId) {
        return RestClientService.execute(AdminRequests.findMessageJobOverviewByAdminIdAndMessageJobId, {
              "pathParams": {
                "adminId": adminId,
                "messageJobId": messageJobId
              }
            }
        );
      }

      function findMessageTasksByAdminIdAndMessageJobIdAsyncImpl(adminId, messageJobId) {
        return RestClientService.execute(AdminRequests.findMessageTasksByAdminIdAndMessageJobId, {
              "pathParams": {
                "adminId": adminId,
                "messageJobId": messageJobId
              }
            }
        );
      }


      function loadCustomMailServerSettingsImpl(adminId) {
        return RestClientService.execute(AdminRequests.findCustomMailServerSettingsByDinnerAdminId, {
                "pathParams": {
                    "adminId": adminId
                }
            }
        );
      }

      function saveCustomMailServerSettingsImpl(adminId, mailServerSettings) {
          return RestClientService.execute(AdminRequests.saveCustomMailServerSettings, {
                  "pathParams": {
                      "adminId": adminId
                  },
                  "data" : mailServerSettings
              }
          );
      }

      function checkMailConnectionImpl(adminId, mailServerSettings, testEmailAddress) {
          return RestClientService.execute(AdminRequests.checkMailConnectionByDinnerAdminId, {
                  "pathParams": {
                      "adminId": adminId
                  },
                  "queryParams": {
                      "testEmailAddress": testEmailAddress
                  },
                  "data" : mailServerSettings
              }
          );
      }

      function getTeamArrangementMailPreviewAsyncImpl(adminId, teamArrangementMessage) {
          return RestClientService.execute(AdminRequests.getTeamArrangementMailPreview, {
                  "pathParams": {
                      "adminId": adminId
                  },
                  "data" : teamArrangementMessage
              }
          );
      }

      function sendTeamArrangementMailsAsyncImpl(adminId, teamArrangementMessage, sendToDinnerOwner) {
          return RestClientService.execute(AdminRequests.sendTeamArrangementMails, {
                  "pathParams": {
                      "adminId": adminId
                  },
                  "queryParams": {
                    "sendToDinnerOwner": _isSendToDinnerOwner(sendToDinnerOwner)
                  },
                  "data" : teamArrangementMessage
              }
          );
      }

      function getParticipantMailPreviewAsyncImpl(adminId, participantMailMessage) {
        return RestClientService.execute(AdminRequests.getParticipantMailPreview, {
                "pathParams": {
                  "adminId": adminId
                },
                "data" : participantMailMessage
            }
        );
      }

      function sendParticipantMailsAsyncImpl(adminId, participantMailMessage, sendToDinnerOwner) {
        return RestClientService.execute(AdminRequests.sendParticipantMails, {
            "pathParams": {
                "adminId": adminId
            },
            "queryParams": {
              "sendToDinnerOwner": _isSendToDinnerOwner(sendToDinnerOwner)
            },
            "data" : participantMailMessage
          }
        );
      }

      function sendTeamPartnerWishInvitationAsyncImpl(adminId, participantId) {
        return RestClientService.execute(AdminRequests.sendTeamPartnerWishInvitation, {
              "pathParams": {
                "adminId": adminId,
                "participantId": participantId
              }
            }
        );
      }

      function getDinnerRouteMailPreviewAsyncImpl(adminId, dinnerRouteMailMessage) {
        return RestClientService.execute(AdminRequests.getDinnerRouteMailPreview, {
                "pathParams": {
                    "adminId": adminId
                },
                "data" : dinnerRouteMailMessage
            }
        );
      }

      function sendDinnerRouteMailsAsyncImpl(adminId, dinnerRouteMailMessage, sendToDinnerOwner) {
        return RestClientService.execute(AdminRequests.sendDinnerRouteMails, {
                "pathParams": {
                    "adminId": adminId
                },
                "queryParams": {
                  "sendToDinnerOwner": _isSendToDinnerOwner(sendToDinnerOwner)
                },
                "data" : dinnerRouteMailMessage
            }
        );
      }

      /**
       * Handles either messageJob or messageTask
       * @param messageJobOrTask
       * @returns {*}
       */
      function getStatusResultImpl(messageJobOrTask) {

        var sendingStatus = messageJobOrTask.sendingStatus;
        if (sendingStatus !== Constants.SENDING_STATUS.SENDING_FINISHED) {
          return Constants.SENDING_STATUS_RESULT.SENDING_NOT_FINISHED;
        }

        var sendingFailed = _.get(messageJobOrTask, "sendingFailed", null);
        if (!sendingFailed) {
          sendingFailed = _.get(messageJobOrTask, 'sendingResult.delieveryFailed', null);
          if (sendingFailed === true) {
            sendingFailed = "TRUE";
          } else {
            sendingFailed = "FALSE";
          }
        }

        if (sendingFailed === 'TRUE') {
          return Constants.SENDING_STATUS_RESULT.SENDING_FINISHED_FAILURE;
        } else {
          return Constants.SENDING_STATUS_RESULT.SENDING_FINISHED_SUCCESS;
        }
      }

      function reSendMessageTaskAsyncImpl(adminId, messageTask) {
        return RestClientService.execute(AdminRequests.reSendMessageTask, {
              "pathParams": {
                "adminId": adminId,
                "messageTaskId": messageTask.id
              },
              "data" : messageTask
            }
        );
      }

      function getMessageJobUrlImpl(adminId, messageJobId) {
        return $state.href('admin.messagejobs.details', { adminId: adminId, messageJobId: messageJobId});
      }

      function _isSendToDinnerOwner(sendToDinnerOwner) {
        return sendToDinnerOwner === true;
      }

    }

}(angular));
