(function(angular) {
  'use strict';

  angular.module('rd.self.components').component('manageTeamPartnerWish', {
    bindings: {
      parameters: '<'
    },
    template:
        '<div class="row" ng-if="!$ctrl.showSuccessMessage">\n' +
        '  <div class="col-xs-12">\n' +
        '    <h3 translate="manage_teampartner_wish_title"></h3>\n' +
        '    <h5 translate="manage_teampartner_wish_help"></h5>\n' +
        '  </div>\n' +
        '</div>' +

        '<div class="row margin-top" ng-if="!$ctrl.showSuccessMessage">\n' +
        '  <div class="col-xs-12">\n' +
        '    <label for="teamPartnerWish" translate="teampartner_wish"></label>\n' +
        '    <input type="text" class="form-control" id="teamPartnerWish" ng-model="$ctrl.teamPartnerWish" />\n' +
        '  </div>\n' +
        '</div>' +

        '<div class="row margin-top" ng-if="!$ctrl.showSuccessMessage">\n' +
        '  <div class="col-xs-12 margin-top">\n' +
        '    <button type="submit" class="btn btn-lg btn-success pull-right"\n' +
        '            ng-click="$ctrl.updateTeamParnerWish()" promise-btn>\n' +
        '      {{ \'save\' | translate }}\n' +
        '    </button>\n' +
        '  </div>\n' +
        '</div>' +

        '<div class="row margin-top" ng-if="$ctrl.showSuccessMessage">\n' +
            ' <div class="col-xs-12">\n' +
              '<callout icon="fa-check" headline="\'congratulation\'"><span translate="manage_teampartner_wish_success"></span></callout>' +
          '  </div>\n' +
        '</div>',

    controller : function(SelfAdminService, ErrorHandler, NotificationService) {

      var ctrl = this;

      ctrl.$onInit = function() {
        ctrl.teamPartnerWish = ctrl.parameters.email;
        ctrl.showSuccessMessage = false;
      };

      ctrl.updateTeamParnerWish = function() {
        return SelfAdminService.updateTeamPartnerWishAsync(ctrl.parameters.selfAdministrationId, ctrl.parameters.participantId, ctrl.teamPartnerWish)
                                .then(function() {
                                  ctrl.showSuccessMessage = true;
                                }).catch(function(errorResponse) {
                                  var errorMessage = ErrorHandler.getSingleTranslatedIssueMessageFromResponse(errorResponse);
                                  if (!errorMessage) {
                                    errorMessage = 'generic_error_label';
                                  }
                                  NotificationService.error(errorMessage);
                                });
      };

    }

  });

})(angular);
