angular.module('rd.admin.constants').constant('AdminMessages_lang_en', {

  address_data: 'Address',

  cancelled: 'Cancelled',

  confirmation_unsaved_data_text: 'Not yet saved changes. Do you want to continue and lose all your not-saved data or do you want to go back to the form?',
  confirmation_unsaved_data_title: 'Attention',

  dismiss_save: 'Dismiss changes',

  headline_teams: 'Teams',

  selection_all: 'Select/Deselect all',
  teams_selection: 'Team selection',
  participants_selection: 'Participant selection',

  gender_unknown: 'Unknown gender',

  label_participant_edit_success: 'Participant successfully saved!',

  teampartner_placeholder: 'EMail address of team partner wish',

  team_partner_wish_help: 'Has this participant a fixed team partner wish? ' +
      'By entering the EMail address of this wished team partner, it is ensured that both will be mixed up into one team.',

  team_partner_wish_not_existing_text: 'You have entered <strong>{{ teamPartnerWish }}</strong> as team partner wish, which however does not exist in your event so far.',
  team_partner_wish_not_existing_send_email_text: 'Do you want to send an invitation mail to this partner wish?',
  team_partner_wish_not_existing_create_public_text: 'Or alternatively: Do you want to directly create this partner wish?',
  team_partner_wish_not_existing_create_closed_text: 'Do you want to directly create this partner wish?',
  team_partner_wish_send_invitation_email: 'Send invitation mail',
  team_partner_wish_create: 'Create partner wish',
  team_partner_wish_add: 'Enter as partner wish',
  team_partner_wish_existing_text: 'You have entered <strong>{{ matchingParticipant }}</strong> as team partner wish. ' +
      '<strong>{{ matchingParticipant }}</strong> already exists in your event.<br/> ' +
      'Do you want to enter <strong>{{ participant }}</strong> as well als team partner wish in <strong>{{ matchingParticipant }}</strong>?',

  dinner_not_possible: 'With the current settings and participants it is not possible to create a running dinner event. Most like there exist too few participants.',

  open_dinner_link_help: 'You can share this link with your friends and acquaintances. Each person who knows this link can self-register to your event.',
  admin_activities_headline: 'Activities',

  checklist_create_dinner: 'Create running dinner',
  checklist_send_participant_messages: 'Send messages to your participants',
  checklist_create_teamarrangements: 'Mix your participants into teams',
  checklist_send_team_messages: 'Send messages to each created team',
  checklist_send_dinnerroute_messages: 'Send dinner routes to each team',
  checklist_end_of_registrationdate: 'Wait till end of registration deadline',
  checklist_end_of_registrationdate_days_left: '{{ days }} days remaining',


  mails_subject: 'Subject',
  mails_message: 'Message',
  mails_template_help: 'Please use following templates',
  mails_team_sendmessage_headline: 'Team Messages',
  mails_sendteams_host: 'Message for host',
  mails_sendteams_nonhost: 'Message for non-host',
  mails_template_sendteams_message: 'Hello {firstname} {lastname},\n\nYour team-partner will be:\n\n{partner}.\n\nYou have been assigned the following meal: {meal}.\n' +
                                    'The time for your meal will be {mealtime}.\n\n{host}\n\nYou can manage the host arrangement by yourself (until final dinner routes are set up) if you wish another host arrangement. ' +
                                    'Please use the following link for doing so:\n{managehostlink}\nPlease talk to each other however before doing so!',

  mails_template_sendteams_host: 'You are suggested to be the host. ' +
                                  'If this is not okay for you then please talk to your team partner and re-arrange this setting if needed.',
  mails_template_sendteams_nonhost: '{partner} is suggested to be the host.',

  mails_template_replacement_host: 'This text will replace the {host} template for the participant which will be the host.',
  mails_template_replacement_nonhost: 'This text will replace the {host} template for the participant which is NOT the host.',
  mails_template_replacement_route_host: 'This text will replace the {route} template for the hosting team.',
  mails_template_replacement_route_guest: 'This text will replace the {route} template for the guest teams',

  mails_team_sendmessage_button: 'Send Team Messages!',
  mails_template_sendparticipants_message: 'Hello {firstname} {lastname},\n\n *ENTER YOUR MESSAGE*',
  mails_participant_sendmessage_button: 'Send Participant Messages!',
  mails_participant_sendmessage_headline: 'Participant Messaging',

  mails_template_senddinnerroute_message: 'Hello {firstname},\n\nhere is your dinner route: \n\n{route}\n\n' +
                                          'You can find a live view of you dinner route by this link:\n{routelink}\n\n' +
                                          'Please try to keep the schedule!!',
  mails_template_senddinnerroute_self: '{meal} is YOUR turn.\nWill be cooked at {firstname} {lastname}\nTime: {mealtime} \n{mealspecifics}',
  mails_template_senddinnerroute_hosts: '{meal}\nWill be cooked at: {firstname} {lastname}\n{hostaddress}\nTime: {mealtime}',
  mails_template_help_description: 'During sending these placeholders will be replaced by the data of each individual participant. ' +
      'You can take the preview, if you are curious about what the final result will look like.',
  mails_senddinnerroute_self: 'Template for the meal decription of the team that will cook this meal.',
  mails_senddinnerroute_hosts: 'Template for the meal description of the teams that will be visited on the dinner route',
  mails_senddinnerroute_sendmessage: 'Send Dinner Routes',


  mails_send_to_dinner_owner: 'Successfully sent test EMail(s). Please check your mailbox.',

  messages_send_general: 'Send messages',
  messages_send_teams: 'Team-Arrangements...',
  messages_send_dinnerroutes: 'Dinner-Routes...',
  messages_send_participants: 'Message to participants...',

  message_send_to_me: 'Send to me (Test)',
  send: 'Send',

  mealtimes_updated_success: 'Time schedule successfully changed!',
  attention: 'Attention!',
  attention_mealtimes_messages_already_sent: 'If you change the time schedule now, please consider sending messasges to all of your participants so that they know about this change.',

  participant_new: 'New participant',
  // participant_edit_success: 'Änderungen an {{ fullname }} gespeichert!',
  // participant_create_success: '{{ fullname }} erfolgreich hinzugefügt!',
  participant_save_success: '{{ fullname }} successfully saved!',
  participant_empty_selection: 'Please select a participant for viewing and/or editing his details!',

  fill_with_example_data: 'Fill with example data',

  participants_not_enough: 'Too few participants',
  participants_no_existing: 'No participants',
  participants_no_existing_text: 'No participants so far. You can also manually add participants if you know that they will take part on your event.',
  participants_remaining_not_assignable_text: 'Following participants could not be mixed up into teams and are thus placed on the waiting list for now.',
  participants_remaining_not_assignable_headline: 'Waiting list',

  participants_all_assignable_text: 'Congratulations, all of your participants can be mixed up into teams.',
  participants_all_assignable_headline: 'Waiting list is empty',
  participants_number_waiting_list: ' (with {{ numRemainingNotAssignableParticipants }} on waiting list)',

  participant_teampartnerwish_sent_invitation: 'Invitation to {{ email }} was successfully sent.',
  participant_teampartnerwish_new_participant: 'Please fill in all needed data and save this new participant!',
  participant_teampartnerwish_update_participant: '{{ fullnameThis }} was added as well as team-partner-wish in {{ fullnameOther }}',

  participants_too_few_text: 'Unfortunately you have too few participants for a Running Dinner event. ' +
      'You need at least a total of {{ minSizeNeeded }} participants, hence you need still at least {{ missingParticipants }} more participants.',

  participant_subscription_activation_manual: 'Confirm manually...',
  participant_deletion_confirmation_headline: 'Do you really want to delete {{ fullname }}?',
  participant_deletion_confirmation_text: 'All data from {{ fullname }} will be deleted and cannot be recovered.',
  participant_deletion_confirmation_team_hint: 'Due to this participant is already assigned into a team, this participant will firstly cancelled.',
  participant_deletion_success_text: '{{ fullname }} was successfully deleted!',
  participant_cancel: 'Cancel participant...',

  participant_search_placeholder: 'Search for name, email, or address',
  participants_number: '<strong>{{ numberParticipants }}</strong> participants',

  team: 'Team {{ teamNumber }}',
  team_jump_link: 'Goto to team {{ teamNumber }}',
  team_host_saved: 'New host successfully saved',
  team_schedule: 'Team schedule',
  teams_no_valid_host: 'No participant have enough seats',
  teams_host: 'Host is <strong>{{ host }}</strong>',
  teams_host_change: 'Change host',
  teams_no_selection: 'Please select a team for viewing and/or editing it\'s details!',
  teams_reset: 'Reset teams and generate again',
  teams_reset_success_text: 'Old team arrangements were removed and new team arrangements have been generated',
  teams_reset_confirmation: 'Do you really want to re-generate the team arrangements? All existing teams will be discarded and new (random) team arrangements will be created.',
  teams_reset_hint_team_messages_sent: 'You probably have already sent messages about the team arrangements, ' +
      'please think about to notify your teams (if not already happened) that the already sent team arrangements are not valid any longer.<br/> ' +
      'Finally you should send again messages to the new generated teams.',
  teams_reset_hint_dinnerroute_messages_sent: 'You have already sent messaages about the dinner routes. When re-generating the team arrangements, the ' +
      'already sent dinner routes (and also team arrangements) will be not valid any longer. You should notify all teams in detail about this issue, before performing this action!',

  teams_show_dinnerroute: 'Show dinner route',
  teams_drag_drop_hint: 'You can swap team-members of different teams by using Drag &amp; Drop.',
  team_replaced_text: '(Team was replaced by other participants)',
  team_cancel: 'Cancellation of team...',
  team_message: 'Message to team',
  team_notify_cancellation: 'Notify all affected teams...',
  team_swap_success_text: '{{ fullnameSrc }} was successfully swapped with {{ fullnameDest }}!',
  team_cancel_member_success_text: '{{ fullname }} was removed from team and deleted',

  team_member_cancel: 'Cancellation of {{ teamMemberToCancel }}',
  team_member_cancel_info: 'Team member <strong>{{ teamMemberToCancel }}</strong> will be removed, the team will however still exist. ' +
      'This means that {{ remainingTeamMemberNames }} will cook alone. ' +
      'You can also cancel the complete team, if {{ remainingTeamMemberNames }} will not participate any longer. ' +
      'You can also replace team members by participants that are on the waiting list (if any).',
  team_member_cancel_host_info: 'Due to this team member was the host, another team member will automatically become the new host.',
  team_member_cancel_whole_team: '<strong>{{ teamMemberToCancel }}</strong> is the last team member of this team. Therefore the complete team must be cancelled ' +
      'which can be performed in the next step.',
  team_member_cancel_delete: 'Cancel &amp; Delete',
  team_member_cancel_goto_team_cancel: 'Goto team cancellation...',

  team_cancel_info_text: 'If a team must be completly cancelled (due to all members are cancelled) you can replace this team by participants from the waiting list. ' +
      'This works however only if there are enough participants on the waiting list, otherwise the meal of this team will completly be cancelled.',

  team_cancel_info_headline_too_few_participants: 'Not enough participants on waiting list for replacing complete team!',
  team_cancel_info_text_too_few_participants: 'You need <strong>{{ numNeededParticipants }}</strong> more participants.<br> ' +
      'You can just cancel the complete team when proceeding to the next step.',

  team_cancel_info_headline_sufficient_participants: 'Sufficient number of participants on waiting list!',
  team_cancel_info_text_sufficient_participants: 'Select <strong>{{ teamSize }}</strong> new participants for replacing {{ teamName }}.',

  affected_hosting_teams: 'Affected hosting teams',
  affected_guest_teams: 'Affected visiting teams',
  team_cancel_remove_text: 'The following team members will be removed from {{ teamName }}...',
  team_cancel_replaced_by_text:'... and will be replaced by the following participants:',

  team_cancel_complete_message: 'The meal <strong>{{ meal }}</strong> of team {{ teamNumber }} will completely be cancelled, ' +
      'due to you don\'t have selected enough replacing participants.',
  team_cancel_complete_headline: 'Cancellation of team {{ teamNumber }}',
  team_cancel_replace_headline: 'Replacement of team {{ teamNumber }}',
  invalid_size_replacement_participants_too_little: 'Not enough participants selected',
  invalid_size_replacement_participants_too_many: 'Selected too much participants',
  team_swap_violates_team_partner_wish: 'The swap of those team members would violate at least one team partner wish and is hence blocked. ' +
      'If you really want to perform this action, then you have to remove the respective team partner wishes of the affected participants',

  team_cancel_hint_dinnerroutes_sent: 'You should notify all affected teams about the cancellation in the next step, ' +
      'due to you have arlready sent dinner routes.',
  team_cancel_hint_notify_teams: 'The affected teams don\'t know yet that they will be hosts and/or guests of {{ teamName }}. ' +
      'You can however notify the affected teams in the next step, about the issue that they have to skip one meal on their dinner route.',

  team_cancel_replace_team_members: 'Replace team members',
  team_cancel_button: 'Cancel team',
  team_cancel_replace_team_members_success: '{{ cancelledOrReplacedTeam }} was successfully replaced by new participants.',
  team_cancel_success: '{{ cancelledOrReplacedTeam }} was successfully cancelled.',

  teams_generate_deadline_open_info: 'The registration deadline is still open till {{ endOfRegistrationDate }}.',
  teams_generate_deadline_open_warning: 'The registration deadline is still open till {{ endOfRegistrationDate }}. Do you really want to generate team arrangements?',

  participants_count_public_event: 'Currently there are <strong>{{ numParticipants }}</strong> participants registrated.',
  participants_count_closed_event: 'Currently you have <strong>{{ numParticipants }}</strong> participants in your event.',

  participants_count_sufficient: 'With these participants you would be ableto create <strong>{{ numExpectedTeams }}</strong> Teams. ' +
      'There are <strong>{{ numNotAssignableParticipants }}</strong> participants which cannot be mixed up into teams.',

  participants_count_too_few: 'Currently you have not enough participants for generating teams.',

  teams_generate: 'Generate team arrangements!',

  settings_basics: 'Basics',
  settings_public_registration: 'Registration settings',
  settings_cancel_event: 'Cancel event...',
  settings_saved_success: 'Settings successfully saved',
  deactivate_registration: 'Deactivate registration',
  activate_registration: 'Activate registration',
  deactivate_registration_confirmation_text: 'Do you really want to deactivate the registration of your event? ' +
      'By doing so, no new participants can sign up any longer (you can however still add participants manually).',
  activate_registration_confirmation_text: 'Do you really want to activate the registration of your event again? ' +
      'By doing so new participants can sign up again.',

  event_cancel_headline: 'Cancel Running Dinner Event',
  event_cancel_button: 'Cancel event finally',
  event_cancel_text: '<p>You are going to finally cancel your event.</p>\n' +
      '          <p>This action cannot be undone, so please think carefully about this issue before finally cancelling your event!</p>\n' +
      '          <p>All data of this event will automatically be deleted within 1-2 days and cannot be recovered. For so long you can still view the data.</p>',
  event_cancel_text_no_registration_hint: 'No participant can registrate himself after cancelling the event.',
  event_cancel_send_messages_hint: 'You should notify all registered participants about the cancellation, ' +
                                   'hence you will directly be redirected to the participant messaging after cancellation.',

  messagejob_type_participant: 'Participant Messaging',
  messagejob_type_team: 'Team Messaging',
  messagejob_type_dinner_route: 'Dinner-Route Messaging',
  recipient_email: 'Recipient email address',

  participant_selection_text: 'Select participants for sending mails',
  team_selection_text: 'Select teams for sending mails',

  invalid_size_selected_participants_message_empty: 'You need at least one recipient for sending messages. There is no single recipient with the current selection.',

  address_city_zip_invalid: 'Zip must contain at least 4 digits',

  SENDING_NOT_FINISHED: 'Currently sending...',
  SENDING_FINISHED_FAILURE: 'Sending with failures',
  SENDING_FINISHED_SUCCESS: 'Sending succeeded',

  synchronize_messagejobs_help: 'It is not guaranteed that every message will successfully be transferred to each recipient, event if the sending is marked as successful: ' +
      'Emails can e.g. be marked as spam or a mailbox may be full, ... ' +
      'RunYourDinner will try to detect such issues and show them to you, but this may take some time (hours till days).',

  FAILURE_TYPE_INVALID_EMAIL: 'Invalid email address',
  FAILURE_TYPE_BOUNCE: 'Bounce',
  FAILURE_TYPE_SPAM: 'Spam',
  FAILURE_TYPE_BLOCKED: 'Blocked (e.g. from provider)',

  confirmation_activate_subscription_title: 'Do you really want to manually confirm {{ participantEmail }}?',
  confirmation_activate_subscription_text: 'This action should only be performed if a participant has not received his confirmation email, but wants to attend the event.<br/><br/>' +
      '<em>Internally it will be noted that the confirmation was performed by the event creator and not by the participant himself.</em>',

  runningdinner_acknowledge_title: 'Confirmation of Running Dinner Event',
  runningdinner_acknowledge_congratulation_title: 'Successful Confirmation',
  runningdinner_acknowledge_congratulation_text: 'Congratulations, you have successfully confirmed your created running dinner event. ' +
      'Now you can use all features (also sending messages)!',

  runningdinner_acknowledge_error_title: 'Confirmation failed',
  runningdinner_acknowledge_error_text: 'Unfortunately there occurred an error while trying to confirm your running dinner event. Please try it again later.<br />' +
      'If this error still occurrs, then write a message to <a href="mailto:{{ adminEmail }}">{{ adminEmail }}</a>.',

  checklist: 'Checklist',
  time_schedule: 'Time schedule',
  time_schedule_edit: 'Edit time schedule',
  latest_registrations: 'Latest registrations',
  registration_not_yet_confirmed: 'Registration not yet confirmed',
  no_registrations: 'No registrations',
  activities_none: 'No activities!',

  participant_selection_all: 'All participants',
  participant_selection_assigned_to_teams: 'Only participants mixed up into teams',
  participant_selection_not_assigned_to_teams: 'Only participants on waiting list',
  participant_selection_single_selection: 'Single selection...',

  participant_selection_all_text: 'All <strong>{{ numberOfSelectedParticipants }}</strong> participants selected',
  participant_selection_assigned_to_teams_text: '<strong>{{ numberOfSelectedParticipants }}</strong> participants mixed up into teams selected',
  participant_selection_not_assigned_to_teams_text: '<strong>{{ numberOfSelectedParticipants }}</strong> participants on waiting list selected',
  participant_selection_single_selection_text: 'Selected participants:',

  team_selection_all: 'All teams',
  team_selection_single_selection: 'Single selection...',

  team_selection_all_text: 'All <strong>{{ numTeams }}</strong> teams selected',
  team_selection_single_selection_text: 'Selected teams:',

  team_single_message_headline: 'Single team message',
  team_cancellation_message_headline: 'Team cancellation message',

  protocols: 'Protocols',
  protocols_empty: 'No messages sent so far',
  protocols_last_update_text: 'Last updated at {{ lastPollDate }}',
  protocols_messages_size_text: '{{ numberOfMessageTasks }} Nachrichten',
  protocols_transfer_headline_prefix: 'Transfer list for ',

  sending_started_at_text: 'Sending started at',
  sending_finished_at_text: 'Sending finished at',
  send_again: 'Send again',
  send_again_help_text: 'You can edit the message (or even change the recipient email address) before trying to send the message again.',
  transfer: 'Transfer',

  goto_dashboard: 'Goto Dashboard',

  notification_dinner_cancellation_text: 'You have finally cancelled this dinner event at {{ cancellationDate }}. Please notify all participants if not yet done. ' +
      'All data will automatically be deleted in the next days.',

  notification_dinner_demo_mode: 'This is the demo mode. You can test all features. All messages will however be send to you (instead of the "real" recipients).',

  notification_dinner_acknowledge_required: 'Currently you can\'t send any messages, due to you have not yet confirmed your dinner event (check your emails for a confirmation link).',

  mails_send_participants_title: 'Send mails to Participants - Running Dinner Administration',
  mails_send_teams_title: 'Send mails to Teams - Running Dinner Administration',
  mails_send_dinnerroutes_title: 'Send Dinner Routes - Running Dinner Administration',
  mail_protocols: 'Mail Protocols',
  confirmation_title: 'Acknowledge - Running Dinner Administration',

  dashboard: 'Dashboard'

});
