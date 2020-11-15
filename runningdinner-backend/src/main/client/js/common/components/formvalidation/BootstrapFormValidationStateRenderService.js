(function(angular) {
  'use strict';

  angular.module('rd.common.components').factory('BootstrapFormValidationStateRenderService', BootstrapFormValidationStateRenderService);

  function BootstrapFormValidationStateRenderService() {

    return {
      extractValidationStateElement: extractValidationStateElementImpl,
      onEnterInvalidState: onEnterInvalidStateImpl,
      onLeaveInvalidState: onLeaveInvalidStateImpl
    };

    function extractValidationStateElementImpl(jqElement) {
      var jqElementParent;
      var jqTmpParent = jqElement.parents();
      var LEVEL_UP_COUNT_TO_CHECK = 5;

      for (var i = 0; i < LEVEL_UP_COUNT_TO_CHECK; i++) {
        if (jqTmpParent.eq(i).hasClass('form-group')) {
          jqElementParent = jqTmpParent.eq(i);
          break;
        } else if (jqTmpParent.eq(i).hasClass('checkbox') || jqTmpParent.eq(i).hasClass('radio')) {
          jqElementParent = jqTmpParent.eq(i + 1);
          break;
        }
      }
      return jqElementParent;
    }

    function onEnterInvalidStateImpl(jqElementParent, jqElement) {
      jqElementParent.addClass('has-error');
    }

    function onLeaveInvalidStateImpl(jqElementParent, jqElement) {
      jqElementParent.removeClass('has-error');
    }


  }

})(angular);
