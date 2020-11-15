(function(angular) {
  'use strict';

    angular
      .module('rd.wizard.services')
      .factory('CreateWizardService', CreateWizardService);

    function CreateWizardService(RestClientService, RunningDinnerService, Constants, WizardRequests, UtilService,
                                 LocaleHandlerService, HttpSerializationService, $translate, _) {

     var dinnerModel = {
        basicDetails: {
          title: "",
          city: "",
          zip: "",
          date: null,
          registrationType: "",
          languageCode: "de"
        },

        options: {
          teamSize: 2,
          meals: [],
          forceEqualDistributedCapacityTeams: true,
          genderAspects: ""
        },

        email: "",
        runningDinnerType: Constants.RUNNING_DINNER_TYPE.STANDARD,

        publicSettings: {
          title: "",
          description: "",
          endOfRegistrationDate: null,
          allowFixedTeamRegistration: true,
          zipRestricted: false,
          zipRestrictions: ""
        },

        participantUploadSettings: {
          fileId: "",
          parsingConfiguration: {
            firstRow: 2
          }
        },

        contract: {}
      };

      var uploadColumnMappingOptions = [];
      var supportedUploadFileExtensions = ["xls", "xlsx"];

      return {
        createWizardDinnerModel: createWizardDinnerModelImpl,
        createRunningDinner: createRunningDinner,
        isClosedDinner: isClosedDinner,

        validateBasicDetails: validateBasicDetailsImpl,
        validateOptions: validateOptionsImpl,
        validatePublicSettings: validatePublicSettingsImpl,

        addMeal: addMealImpl,
        removeMeal: removeMealImpl,

        getMinimumParticipantsNeeded: getMinimumParticipantsNeededImpl,

        isValidUploadFilename: isValidUploadFilename,
        createParsingConfiguration: createParsingConfiguration,
        loadUploadColumnMappingOptions: loadUploadColumnMappingOptions,
        parseUploadedParticipantFile: parseUploadedParticipantFile,
        getNumAssignableParticipants: getNumAssignableParticipants
      };

      function createWizardDinnerModelImpl(demoDinner) {
        var result = angular.copy(dinnerModel);
        if (demoDinner === true) {
          result.runningDinnerType = Constants.RUNNING_DINNER_TYPE.DEMO;
          _fillDemoDinnerValues(result);
        }
        result.basicDetails.languageCode = LocaleHandlerService.getCurrentLanguage();
        return result;
      }

      function createRunningDinner(dinnerModel) {
        dinnerModel.contract.email = dinnerModel.email;
        return RestClientService.execute(WizardRequests.createRunningDinner, {
          "data" : dinnerModel
        }).then(function (response) {
          return response.administrationUrl;
        });
      }

      function isClosedDinner(dinner) {
        return RunningDinnerService.isClosedDinner(dinner);
      }

      function validateBasicDetailsImpl(dinnerModel) {
        return RestClientService.execute(WizardRequests.validateBasicDetails, {
          "data" : dinnerModel.basicDetails
        })
        .then(function(response) {
          _assureMealsExist(dinnerModel);
          _adjustDateSettingsImpl(dinnerModel);
          _setContractAddressFromBasicDetails(dinnerModel);
          return response;
        });
      }

      function validateOptionsImpl(dinnerModel) {
        var runningDinnerDateStr = HttpSerializationService.serializeLocalDateToQueryParameter(dinnerModel.basicDetails.date);
        return RestClientService.execute(WizardRequests.validateOptions, {
          "data" : dinnerModel.options,
          "queryParams": {
            "runningDinnerDate": runningDinnerDateStr
          }
        });
      }

      function validatePublicSettingsImpl(dinnerModel) {
        var runningDinnerDateStr = HttpSerializationService.serializeLocalDateToQueryParameter(dinnerModel.basicDetails.date);
        return RestClientService.execute(WizardRequests.validatePublicSettings, {
          "data" : dinnerModel.publicSettings,
          "queryParams" : {
            "runningDinnerDate": runningDinnerDateStr
          }
        }).then(function(response) {
          _setEmailFromPublicContactEmailIfNeeded(dinnerModel);
          _setContractNameFromPublicSettings(dinnerModel);
          return response;
        });
      }

      function addMealImpl(dinnerModel) {
        var dinnerDate = dinnerModel.basicDetails.date;
        var lastMeal = dinnerModel.options.meals.slice(-1)[0];
        var hourOfLastMeal = lastMeal.time.getHours();
        var minuteOfLastMeal = lastMeal.time.getMinutes();
        dinnerModel.options.meals.push({ label: "", time: _createDateWithHourAndMinute(dinnerDate, hourOfLastMeal + 2, minuteOfLastMeal) });
      }

      function removeMealImpl(dinnerModel) {
          dinnerModel.options.meals.pop();
      }

      function _assureMealsExist(dinnerModel) {
        if (dinnerModel.options.meals && dinnerModel.options.meals.length > 0) {
          return;
        }
        // Create default meals:
        var dinnerDate = dinnerModel.basicDetails.date;
        dinnerModel.options.meals = [];
        dinnerModel.options.meals.push( { label: $translate.instant("appetizer"), time: _createDateWithHourAndMinute(dinnerDate, 19, 0) } );
        dinnerModel.options.meals.push( { label: $translate.instant("main_course"), time: _createDateWithHourAndMinute(dinnerDate, 21, 0) } );
        dinnerModel.options.meals.push( { label: $translate.instant("dessert"), time: _createDateWithHourAndMinute(dinnerDate, 23, 0) } );
      }

      function _createDateWithHourAndMinute(dinnerDate, hour, minute) {
        var result = new Date(dinnerDate.getTime());
        result.setHours(hour, minute, 0, 0);
        return result;
      }

      function _adjustDateSettingsImpl(dinnerModel) {
        var dinnerDate = dinnerModel.basicDetails.date;

        // Meal times
        for (var i = 0;  i < dinnerModel.options.meals.length; i++) {
          var meal = dinnerModel.options.meals[i];
          meal.time = _createDateWithHourAndMinute(dinnerDate, meal.time.getHours(), meal.time.getMinutes());
        }

        // Registration date (if needed):
        if (!isClosedDinner(dinnerModel)) {
          if (!dinnerModel.publicSettings.endOfRegistrationDate || dinnerModel.publicSettings.endOfRegistrationDate.getTime() > dinnerDate.getTime()) {
            var tmpDate = new Date(dinnerDate);
            tmpDate.setDate(tmpDate.getDate() - 5); // Set registration date 5 days back by default
            dinnerModel.publicSettings.endOfRegistrationDate = new Date(tmpDate);
          }
        }
      }

      function _setEmailFromPublicContactEmailIfNeeded(dinnerModel) {
        if (isClosedDinner(dinnerModel)) {
          return;
        }
        if (UtilService.isNotEmptyString(dinnerModel.email)) {
          return;
        }
        dinnerModel.email = dinnerModel.publicSettings.publicContactEmail;
      }

      function _setContractAddressFromBasicDetails(dinnerModel) {
        dinnerModel.contract.zip = dinnerModel.basicDetails.zip;
        dinnerModel.contract.city = dinnerModel.basicDetails.city;
      }

      function _setContractNameFromPublicSettings(dinnerModel) {
        dinnerModel.contract.fullname = _.get(dinnerModel, "publicSettings.publicContactName", "");
      }

      function getMinimumParticipantsNeededImpl(dinnerModel) {
        return RunningDinnerService.getMinimumParticipantsNeeded(dinnerModel);
      }

      function _fillDemoDinnerValues(dinnerModel) {

        var dinnerDate = new Date();
        dinnerDate.setDate(dinnerDate.getDate() + 30); // 30 days in future

        dinnerModel.basicDetails = {
          title: "Demo Running Dinner Event",
          city: "Musterstadt",
          zip: "99999",
          date: dinnerDate,
          registrationType: Constants.REGISTRATION_TYPE.CLOSED
        };

        // Just in case someone chooses public registration type:
        dinnerModel.publicSettings.title = "Das ist ein öffentliches Demo Dinner Event";
        dinnerModel.publicSettings.description = "Das ist die Beschreibung für das öffentliche Demo Dinner Event. " +
                                                  "Da Demo Events nicht auffindbar sind, spielt es keine Rolle was hier steht.";
      }

      /**
       * All methods are deprecated
       * @param participants
       * @returns {number}
       */
      function getNumAssignableParticipants(participants) {
        var numAssignableParticipants = 0;
        for (var i=0; i<participants.length; i++) {
          if (participants[i].assignable) {
            numAssignableParticipants++;
          }
        }
        return numAssignableParticipants;
      }

      function isValidUploadFilename(filename) {
        var filenameLowercase = filename.toLowerCase();
        if (filenameLowercase.lastIndexOf('.') === -1 || filenameLowercase.lastIndexOf('.') >= filenameLowercase.length - 1 ) {
          return false;
        }
        var fileExtension = filenameLowercase.substr(filenameLowercase.lastIndexOf('.') + 1).trim();
        return supportedUploadFileExtensions.indexOf(fileExtension) !== -1;
      }

      function createParsingConfiguration(rows, rowNumber) {
        if (!rows || rows.length <= 0) {
          return [];
        }

        var rowIndex = rowNumber-1;
        if (rowIndex < 0) {
          rowIndex = 0;
        } else if (rowIndex > rows.length) {
          rowIndex = rows.length - 1;
        }

        var row = rows[rowIndex];

        var result = {
          firstRow: rowIndex,
          columnMappings: []
        };

        return loadUploadColumnMappingOptions().then(function(resolvedUploadColumnMappingOptions) {
          for (var i=0; i<row.columns.length; i++) {
            result.columnMappings.push(createColumnMapping(i, resolvedUploadColumnMappingOptions[0]));
          }
          return result;
        });
      }

      function createColumnMapping(columnIndex, mappingSelection) {
        return {
          columnIndex: columnIndex,
          mappingSelection: mappingSelection
        };
      }

      function parseUploadedParticipantFile(dinnerModel) {
        return RestClientService.execute(WizardRequests.parseUploadedParticipantFile, {
          "data":  {
            "fileId": dinnerModel.participantUploadSettings.fileId,
            "parsingConfiguration": dinnerModel.participantUploadSettings.parsingConfiguration
          },
          "queryParams": {
            "teamSize": dinnerModel.options.teamSize,
            "numberOfMeals": dinnerModel.options.meals.length
          }
        }).then(function (response) {
          if (response.success) {
            return {
              "success": true,
              "participants": response.participants
            };
          } else {
            return {
              "success": false,
              "errorType": response.errorType,
              "failedRowNumber": response.failedRowNumber,
              "failedRow": response.failedRow
            };
          }
        });
      }

      function loadUploadColumnMappingOptions() {
        return RestClientService.execute(WizardRequests.findColumnMappingOptions, {}).then(function (response) {
          uploadColumnMappingOptions = response;
          return uploadColumnMappingOptions;
        });
      }

    }

})(angular);
