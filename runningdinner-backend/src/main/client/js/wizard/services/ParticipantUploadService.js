(function(angular) {
  'use strict';

  /**
   * Deprecated
   */
  angular.module('rd.wizard.services').factory('ParticipantUploadService', ParticipantUploadService);

  function ParticipantUploadService($translate, CreateWizardService, FileUploader, WizardRequests, WizardNavigationStates,
                                    BaseController, NotificationService, ErrorHandler) {

    var dinner = null;

    var upload = {
      previewRows: [],
      columnMappingOptions: [],
      result: {
        participants: null,
        error: null
      },
      columnMappingControlsActivated: false,
      finalPreviewControlsActivated: false,
      isFileUploadedSuccess: function () {
        return dinner.participantUploadSettings.fileId && dinner.participantUploadSettings.fileId.length > 0;
      },
      isUploading: function () {
        return upload.uploader.isUploading;
      },
      isFileUploadParsedSuccess: function () {
        return upload.result.participants != null;
      },
      parseUploadedParticipantFile: function () {
        upload.activateColumnMappingControls();
        return CreateWizardService.parseUploadedParticipantFile(dinner).then(function (response) {
          if (response.success) {
            upload.result.participants = response.participants;
            upload.result.error = null;
            upload.activatePreviewFinalResultControls();
          } else {
            upload.result.participants = null;
            angular.extend(upload.result.error, response);
          }
        }, function (errorResponse) {
          // handle / show  erroros
        });
      },
      getParticipantsAssignableStatus: function () {
        var numAssignableParticipants = CreateWizardService.getNumAssignableParticipants(upload.result.participants);
        if (numAssignableParticipants === upload.result.participants.length) {
          return "success";
        }
        if (numAssignableParticipants === 0) {
          return "danger";
        }
        return "warning";
      },
      getParticipantsAssignableStatusMessage: function () {
        var status = upload.getParticipantsAssignableStatus();
        if (status === 'success') {
          return $translate.instant('text_participant_preview_success');
        }
        else if (status === 'danger') {
          return $translate.instant('text_participant_preview_warning');
        } else {
          return $translate.instant('text_participant_preview_danger');
        }
      },
      activatePreviewFinalResultControls: function () {
        upload.finalPreviewControlsActivated = true;
        upload.columnMappingControlsActivated = false;
      },
      activateColumnMappingControls: function () {
        upload.finalPreviewControlsActivated = false;
        upload.columnMappingControlsActivated = true;
      },
      activateUploadFileControls: function () {
        upload.finalPreviewControlsActivated = false;
        upload.columnMappingControlsActivated = false;
      },
      goBackToPreviousWizardStep: function () {
        upload.columnMappingControlsActivated = false;
        upload.finalPreviewControlsActivated = false;
        BaseController.gotoState(WizardNavigationStates.MEALTIMES_STATE.name);
      },
      isUploadFileControlsActivated: function () {
        return upload.finalPreviewControlsActivated === false && upload.columnMappingControlsActivated === false;
      },
      isColumnMappingControlsActivated: function () {
        return upload.columnMappingControlsActivated === true;
      },
      isFinalPreviewControlsActivated: function () {
        return upload.finalPreviewControlsActivated === true;
      }
    };

    return {
      initializeAsync: initializeAsyncImpl
    };

    function initializeAsyncImpl(incomingDinner) {
      dinner = incomingDinner;
      return CreateWizardService.loadUploadColumnMappingOptions().then(function (response) {
        upload.columnMappingOptions = response;
        _createFileUploader();
        return upload;
      });
    }

    function _createFileUploader() {
      upload.uploader = new FileUploader({
        "url": WizardRequests.uploadParticipantsFile.url,
        "autoUpload": true,
        "removeAfterUpload": true,
        "queueLimit": 1,
        "onBeforeUpload": function () {
          NotificationService.remove("uploadError");
        },
        "onSuccessItem": function (item, response, status, headers) {
          upload.previewRows = response.previewRows;
          CreateWizardService.createParsingConfiguration(upload.previewRows, dinner.participantUploadSettings.parsingConfiguration.firstRow).then(function (response) {
            dinner.participantUploadSettings.parsingConfiguration = response;
            dinner.participantUploadSettings.parsingConfiguration.firstRow++; // Don't display 0-index based row number
          });
          dinner.participantUploadSettings.fileId = response.fileId;
          upload.fileName = item.file.name;
          upload.activateColumnMappingControls();
        },
        "onErrorItem": function (item, responseData, status, headers) {
          upload.previewRows = [];
          dinner.participantUploadSettings.parsingConfiguration = {};
          dinner.participantUploadSettings.fileId = null;
          upload.fileName = null;
          ErrorHandler.handleProvidedIssues(responseData.issues, "uploadError");
        },
        filters: [{
          name: 'fileExtensionFilter',
          fn: function (item) {
            NotificationService.remove("uploadFileExtensionFilterError");
            var allowed = CreateWizardService.isValidUploadFilename(item.name);
            if (!allowed) {
              NotificationService.error('label_participant_upload_info', "uploadFileExtensionFilterError");
            }
            return allowed;
          }
        }]
      });
    }

  }

})(angular);
