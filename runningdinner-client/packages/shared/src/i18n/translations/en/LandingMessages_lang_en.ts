const LandingMessages_en: any = {
    registration: 'Registration',

    number_seats_placeholder: 'How many persons can have a seat in your flat?',
    misc_notes_placeholder:'Do you have any further notes?',
    teampartner_placeholder: 'Email of your partner wish (if any)',

    registration_validate: 'Next',
    registration_perform: 'Register now!',
    registration_finish: 'Finish registration',
    registration_finish_check: 'Verify your data:',
    registration_date_expired: 'You cannot register any longer, due to the registration deadline is over.',

    registration_can_host: 'You have enough seats for being a host in this event.',
    registration_no_host: 'You have not enough seats for being a host in this event, ' +
      'hence it will be tried to mix you in a team with a partner with enough seats',

    registration_activation_title: 'Confirmation of registration',
    registration_activation_congratulation_title: 'Successful confirmation',
    registration_activation_congratulation_text: 'Congratulations, you have successfully confirmed your registration for ' +
      '<strong><anchor href="{{ publicDinnerUrl }}" target="_blank">{{ publicDinnerTitle }}</anchor></strong>!<br/>Soon you will receive further ' +
      'information from the organizer (<anchor href="mailto:{{ adminEmail }}">{{ adminEmail }}</anchor>) of the event.',

    registration_activation_error_title: 'Error during confirmation',
    registration_activation_error_text: 'Unfortunately there occurred an error during trying to confirm your registration. ' +
      'Please try it again later. <br/> ' +
      'If the error still occurs, please send an email to <anchor href="mailto:{{ adminEmail }}">{{ adminEmail }}</anchor>.',

    teampartner_wish_summary_not_existing: 'You have entered <italic>{{ teamPartnerWish }}</italic> as team partner wish. ' +
      'This wished partner will receive an invitation email for this dinner event as soon as you confirm your registration. ' +
      'If <italic>{{ teamPartnerWish }}</italic> eventually registers to this event, you will be mixed up into one team.',

    teampartner_wish_summary_match: 'You will cook together with <italic>{{ teamPartnerWish }}</italic> in one team.',

    teampartner_wish_summary: 'You have entered <italic>{{ teamPartnerWish }}</italic> as team partner wish.',

    gender_unknown: "No information",

    registration_finished_headline: 'Registration finished!',
    registration_finished_text: 'You have successfully registrated. In the next minutes you will receive an email with a confirmation link and further information. ' +
      '<br/>Your registration will only be completed when you open this confirmation link. ' +
      'If you did not receive any email, then please send an email to <anchor href="mailto:{{ adminEmail }}">{{ adminEmail }}</anchor>.',

    street_placeholder: 'Your street + nr',
    address_remarks_help: 'Optional: If you are host and your flat is not easy to find, this remarks can help other teams to find your flat.',

    team_partner_wish_help: 'Do you want to cook together with a friend? ' +
      'By entering his email address, your friend will automatically be invited to join this event (if not already registered). ' +
      'You will then be mixed up into one team.',

    misc_notes_help: 'Optional, for any further notes. These notes will only be visible to the organizer of the event.',

    mealspecifics_summary_text: 'You have entered the following eating habits',

    dinner_event_not_found_text: 'No dinner event found for this URL!',
    dinner_event_deadline_text: 'Registration deadline is on {{ endOfRegistrationDate }}.',
    goto_registration: 'Open Registration',

    data_processing_acknowledge: 'I aggree that my data will be processed.',
    data_processing_acknowledge_hint: 'The <anchor href="{{ privacyLink }}" target="_blank">Privacy Statement (DE)</anchor> contains further information.',

    notification_demo_no_registration_text: 'This is just a demo event and no "real" event. A registration for testing purposes is possible, but will have no effect.',

    public_dinner_events_headline: 'Public Running Dinner Events',
    public_dinner_events_empty_text: 'Currently there exist no public running dinner events. You can change this issue by organzing one by yourself.',
    public_dinner_events_empty_headline: 'No events found',
    public_dinner_events_empty_goto_wizard: 'Goto creation wizard',

    for_organizers_headline: 'For Organizers',

    create_event_headline: 'Create your own event',
    create_event_description: 'Create stupid simply your own (private) Running Dinner event - without the need of a registration!<br/>' +
      'You decide whether the event is completely public or whether it is only visible for your private friends.',

    manage_event_headline: 'Manage Event',
    manage_event_description: 'After creation of your running dinner event, almost anything is automatically performed by the application.\n' +
      'All processes like e.g. creating team arrangements or dinner route calculation is done with help of the application.\n' +
      'Nevertheless you can all the time interfere like e.g. changing team arrangements to fit your purposes.',
    manage_event_link: 'Features for Event Management',

    manage_event_party_headline: 'Just run the event & enjoy',
    manage_event_party_description: 'All those cumbersome and complicated work for organzing a running dinner event is completely removed from you, ' +
      'like e.g. sending personalized emails to your participants / teams.<br/>' +
      'The responsibility for the whole event per se is however still at you.<br/><br/>Have fun!',

    for_participants_headline: 'For Participants',

    discover_public_events_headline: 'Discover Public Events',
    discover_public_events_description: 'Find public events close to you and registrate straightforward! ' +
      'You don\'t need to registrate on this platform, you just registrate directly to the event of the organizer.',
    discover_public_events_link: 'Find public event...',

    public_events_no_event_found_headline: 'No public event found?',
    public_events_no_event_found_description: 'Most events are closed and/or private.<br/>' +
      'If there is an event in your circle of friends and acquainrances, you will likely receive a secret link for registration (e.g. by mail, facebook, ...), ' +
      'or maybe you were already added as participant.<br/>If you received such a link, you can use this link for opening the event.',

    privacy_question_headline: 'What happens with my data?',
    privacy_question_description: 'You don\'t need to register to the platform itself, you just need to register to a specific event on which you want to participate.<br/> ' +
      'Therefore you must obviously provide some personal data. This data is however only visible for the event organizer and ' +
      'will be automatically deleted after the event end.',

    privacy_more_infos_link: 'More infos about privacy',

    teaser_what_is_running_dinner_headline: 'What is a Running Dinner?',
    teaser_running_dinner_general_description: 'The concept of a running dinner is also known under the german name "rudirockt - Kochen und Kontakte knüpfen" and was awarded several times ' +
      '(see also <a class="jumbotron-link" href="https://www.wikipedia.de/" target="_blank">Wikipedia</a>).<br/>' +
      'It is also known under the names Flying Dinner or Jumping Dinner.',

    teaser_running_dinner_general_application: 'With <strong>runyourdinner</strong> you can organize your own running dinner event as a no-brainer. ' +
      'Alternatively you can participate in a public running dinner event located next to you.',

    teaser_organize_event_text: 'Create Event',
    teaser_search_public_event_text: 'Find Public Event',

    teaser_how_does_it_work: 'How does it work?',

    teaser_workflow_team_generation: 'After registration deadline all participants will be mixed up into 2er teams.',
    teaser_workflow_team_meals: 'Each team gets notified about which meal (appetizer, main course, dessert) it has the responsibility to cook.',
    teaser_workflow_team_host: 'The assigned meal is cooked in the flat of one team member.',
    teaser_workflow_team_guest: 'Two other teams join this meal as a guest (thus each team cooks for 6 persons total).',
    teaser_workflow_dinner_route: 'After you are finished with eating the meal, you will move on to another team, till all meals are taken.',
    teaser_workflow_dinner_route_finish: 'At the end of the event, each team has met 8 other teams.',

    teaser_example_appetizer: 'The appetizer is cooked in the own flat of one team member. Here two other teams join this meal.',
    teaser_example_main_course: 'After you are finished with eating, you have to hurry to the next flat of another team. ' +
      'Here you will meet two other teams, the host team and another guest team.<br/>' +
      'This time you are the guest and you will eat the main course of the host team.',
    teaser_example_dessert: 'The same applies to the dessert.',
    teaser_example_summary: 'Consequently each meal will be eaten with different teams, thus each team will meet 12 other people during the event. ' +
      'Hopefully no team knows who will join them as a guest team ' +
      'and furthermore each team should only know the addresses of the teams they will visit.',

    create_your_own_event_hedline: 'Create your own running dinner event',
    quickstart_description: 'You can create your own running dinner event with just a few clicks by using the wizard.',
    uncertain_headline: 'Having doubts?',
    uncertain_description: 'You can also create a demo running dinner event for test purposes. ' +
      'This event will automatically be populated with example participants. So you can test all features before starting with a "real" running dinner event.',
    create_demo_dinner_link: 'Create Demo Dinner',

    visibilities_text: 'Choose between 3 different kinds of visibility',

    team_arrangements_meal_feature: 'Automatic team arrangement generation and meal assignment',
    team_arrangements_distribution_feature: 'Random team arrangement distribution or by specific criteria (e.g. gender)',
    team_arrangements_swap_feature: 'Comfortable changes of team arrangements possible by drag & drop',

    dinner_route_calculation_feature: 'Optimal calculation of dinner routes',
    dinner_route_view_feature: 'View of dinner routes',
    dinner_route_googlemaps_feature: 'Google-Maps Integration',

    mail_sending_personalized: 'Personalized sending of mails',
    mail_sending_personalized_description: 'Simple and customizable way for sending individual mails to your participants / teams.',

    mail_sending_personalized_participants: 'Mails to participants',
    mail_sending_personalized_teams: 'Mails for team arrangements',
    mail_sending_personalized_dinnerroutes: 'Mails for Dinner-Routes',

    participant_management_headline: 'Manage Participants',

    participant_management_crud_feature: 'Add / edit / delete participant',
    participant_management_overview_feature: 'Simple overview of all participants',
    participant_management_waitinglist_feature: 'Waiting list function',

    participant_features: 'Participant Features',

    participant_feature_self_registrate: 'Self registrate to non-closed events',
    participant_feature_change_host: 'Team can change the host assignment by themself',
    participant_feature_live_dinnerroute: 'Live view of dinner route',

    misc_feature_dashboard: 'Dashboard with activity stream, checklist, etc.',
    misc_feature_new_participants: 'See new registrations at once',
    misc_feature_cancel_teams: 'Handling of cancellations of teams / participants',
    misc_feature_team_partner_wish: 'Handling of partner wish',

    misc_feature_languages: 'Available in English and German language',

    start_title: 'Application for calculating and performing running dinner events',
    registration_finished_title: 'Registration completed',
    registration_confirm_title: 'Confirm registration',
    create_wizard_title: 'Create and Manage your own Running Dinner',
    impressum_title: 'Impressum & Privacy',

    currentuser_already_registered_info: "You have already registered for this event in this browser with  <italic>{{ email }}</italic>.",
    currentuser_already_registered_cancel: ' If you wish to unsubscribe, please email <anchor href="{{ email }}">{{ email }}</anchor>.',
    currentuser_already_registered_new_register: "If you want to register again, you can still do so here:",

    x: 'x'
};

export default LandingMessages_en;
