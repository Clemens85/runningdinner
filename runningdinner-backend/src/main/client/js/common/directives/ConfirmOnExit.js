(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('confirmOnExit', confirmOnExit);

  function confirmOnExit($window, $state, ConfirmationDialogService) {

    return {
      restrict: 'A',
      require: ['form'],
      scope: {
        saveFunction: '&'
      },
      link: function(scope, element, attrs, formCtrlArr) {

        /*
        var formCtrl = (formCtrlArr && angular.isArray(formCtrlArr)) ? formCtrlArr[0] : formCtrlArr;

        $window.onbeforeunload = function(event) {
          if (formCtrl.$dirty === true) {
            return "Du hast noch nicht gespeicherte Änderungen.";
          }
        };
        scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
          if (formCtrl.$dirty === true) {

            if (fromParams.skipSomeAsync) {
              return;
            }
            event.preventDefault();

            _openConfirmationDialog(formCtrl).then(function() {
              fromParams.skipSomeAsync = true;
              $state.go(toState.name, toParams);
            });
          }
        });

        $transitions.onSuccess({}, function(transition) {
          if (formCtrl.$dirty === true) {
            if (transition.from().params.skipSomeAsync) {
              return true;
            }
            // event.preventDefault();
            return _openConfirmationDialog(formCtrl).then(function() {
              transition.from().params.skipSomeAsync = true;
              // $state.go(transition.to().name, transition.to().params);
              return true;
            }, function() {
              return false;
            });
          }
          return true;
        });


        function _openConfirmationDialog(formCtrl) {
          return ConfirmationDialogService.openConfirmationDialog('confirmation_unsaved_data_title', 'confirmation_unsaved_data_text',
              [{ label: 'back_to_form', class: "btn-link"}, { label: 'continue_dismiss', confirm: true }]).finally(function() {
            // formCtrl.$setPristine();
            // formCtrl.$setUntouched();
          });
        }
        */
      }

    };
  }

})(angular);
