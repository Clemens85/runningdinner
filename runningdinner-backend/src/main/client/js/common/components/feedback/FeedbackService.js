(function(angular) {
  'use strict';

  angular.module('rd.common.components').factory('FeedbackService', FeedbackService);

  function FeedbackService($state, $stateParams, _, CommonRequests, RestClientService) {


    return {
      createFeedbackAsync: createFeedbackAsyncImpl,
      newFeedbackModel: newFeedbackModelImpl
    };

    function newFeedbackModelImpl() {
      var stateName = _.get($state, "current.name", "Unknown");
      var adminId = $stateParams.adminId; // Can be empty

      return {
        adminId: adminId,
        pageName: stateName,
        senderEmail: '',
        message: ''
      };
    }

    function createFeedbackAsyncImpl(feedback) {
      return RestClientService.execute(CommonRequests.createFeedback, {
            "data": feedback
          }
      );
    }
  }

})(angular);
