(function(angular) {
  'use strict';

  angular.module('rd.admin.components').component('adminActivityView', {
    bindings : {
      adminId: '<',
      adminActivities: '<',
      loading: '<'
    },
    controller : AdminActivityViewCtrl,
    templateUrl : 'admin/dashboard/components/adminactivityview.html?v=@@buildno@@'
  });

  function AdminActivityViewCtrl() {

  }

})(angular);
