(function(angular) {
  'use strict';

  angular.module('rd.self.constants').constant('SelfAdminMessages_lang_en', {

    change_team_host_title: 'Manage Host',
    change_team_host_help: 'Here you can change the host setting (you can e.g. enter your team mate as new host or enter yourself as new host. ' +
                            'After saving, this change will immediately be applied.',

    change_team_host_comment: 'Your note',
    change_team_host_comment_help: 'Your team mate will automatically be notified about your change. Here you can leave a personal note.',

    change_team_host_loading_error_text: 'The data for managing the host could not be loaded. Please verify the URL and try it again later.',
    change_team_host_loading_error_title: 'Error while loading data',

    change_team_host_success_text: 'New host is now <strong>{{ newTeamHost }}</strong>.<br> Notifications about the change were sent.',

    change_team_host_button: 'Save as new host',

    manage_teampartner_wish_title: 'Manage Team Partner Wish',
    manage_teampartner_wish_help: 'Here you can confirm and/or change your wished team partner.',
    manage_teampartner_wish_success: 'Successfully saved the change of your wished team partner!',

    team_partner_wish_update_invalid: 'Change of your wished team partner could not be performed. ' +
        'This might happen e.g. due to your wished team partner is not registered or that e.g. the team arrangments were already created.',

    team_partner_wish_manage_title: 'Run Your Dinner - Manage Partner Wish',
    host_manage_title: 'Run Your Dinner - Manage Host',

    x: 'x'
  });

})(angular);
