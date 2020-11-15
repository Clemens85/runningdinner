(function(angular) {
  'use strict';

    angular.module('rd.wizard.constants').constant('WizardNavigationStates', {

        "BASIC_STATE" : {
          name: "wizard.basic",
          number: 1,
          label: 'wizard_step_basics',
          iconClass: 'fa fa-pencil',
          getNextStateName: function() {
            return "OPTION_STATE";
          },
          isVisible: function() {
            return true;
          }
        },
        "OPTION_STATE" : {
          name: "wizard.options",
          number: 2,
          label: 'wizard_step_options',
          iconClass: 'fa fa-cog',
          getNextStateName: function(closedDinner, next) {
            return next === true ? "MEALTIMES_STATE" : "BASIC_STATE";
          },
          isVisible: function() {
            return true;
          }
        },
        "MEALTIMES_STATE" : {
          name: "wizard.mealtimes",
          number: 3,
          label: 'wizard_step_mealtimes',
          iconClass: 'fa fa-clock-o',
          getNextStateName: function(closedDinner, next) {
            if (!next) {
              return "OPTION_STATE";
            }
            if (closedDinner === true) {
              return "PARTICIPANTS_PREVIEW_STATE";
            }
            return "REGISTRATION_SETTINGS_STATE";
          },
          isVisible: function() {
            return true;
          }
        },
        "REGISTRATION_SETTINGS_STATE" : {
          name: "wizard.registration-settings",
          number: 4,
          label: 'wizard_step_public_registration',
          iconClass: 'fa fa-list-ul',
          getNextStateName: function(closedDinner, next) {
            if (!next) {
              return "MEALTIMES_STATE";
            }
            return "PARTICIPANTS_PREVIEW_STATE";
          },
          isVisible: function(closedDinner) {
            return closedDinner === false;
          }
        },
        "PARTICIPANTS_PREVIEW_STATE" : {
          name: "wizard.participants-preview",
          number: 5,
          label: 'wizard_step_participant_preview',
          iconClass: 'fa fa-folder-open-o',
          getNextStateName: function(closedDinner, next) {
            if (!next) {
              if (closedDinner === true) {
                return "MEALTIMES_STATE";
              }
              return "REGISTRATION_SETTINGS_STATE";
            }
            return "FINISH_STATE";
          },
          isVisible: function(closedDinner) {
            return true;
          }
        },
        "FINISH_STATE" : {
          name: "wizard.finish",
          number: 6,
          label: 'wizard_step_finish',
          iconClass: 'fa fa-check',
          getNextStateName: function(closedDinner, next) {
            if (!next) {
              return "PARTICIPANTS_PREVIEW_STATE";
            }
            return "SUMMARY_STATE";
          },
          isVisible: function() {
            return true;
          }
        },

        "SUMMARY_STATE" : {
          name: "wizard.summary",
          number: 7,
          isVisible: function() {
            return false;
          }
        }

    });

})(angular);
