const Wizard_en: any = {
  basic_settings: 'Basic Settings',

  public_settings: 'Data that is seen on Public / Hidden events',

  email_administration_link_help: 'You will receive a message to this EMAil address containing a secret link to the administration area. ' +
      'This EMail address will also later on be used when sending messages to your participants. ' +
      '<strong>This message will contain also another link which you will need to open to confirm that you are really the creator of this event.</strong>',
  administration_link_help: 'Please note down this link or save it to your favorites. Important: This link should NOT be shared with any other people due to it provides acccess to the administration area. ' +
      'Check your mailbox: You should have received an EMail containing this link and containing also another link, which you need to confirm the creation of this event ' +
      '(only after confirming by using this link, the messaging functionality will be unlocked).',
  administration_link_open: 'Open Administration',

  error_required_meal_label: 'Each meal must have a name.',
  error_required_meal_time: 'You must setup the time for each meal.',
  error_invalid_meal_time: 'The time for each meal must be on same day as the event.',
  error_invalid_meal_size: 'Currently we support only events with 2 or 3 meals.',

  team_distribution_help: 'Automatically try to build teams so that a team consists of one participant that cannot host and one participant that can host (due the number of seats is sufficient).',

  team_size: 'Team size',

  team_distribution_force_equl_hosting: 'Try to mix teams to equal hosting capabillities',

  gender_aspects: 'Gender distribution',
  gender_aspects_help: 'Gender of participants must be specified for this option to work.',

  meals_help: 'You can change the name of the meals and/or add new ones or remove existing ones. You need however at least 2 meals.',

  time_setup: 'Setup meal times',

  participants_preview: 'Participant preview',
  participants_preview_text: 'With the current settings, you need at <strong>least</strong> <strong>{{ numParticipants }}</strong> participants for being able to run your dinner event.',
  participants_preview_demo_text: 'The system will automatically create <strong>18</strong> demo participants for your demo event, so that you can easily start to test ' +
      'all functionalities in no time. You can create of course also your own participants for test purposes.',

  almost_there: 'Almost there...',

  administration_email_label: 'Your EMail address',

  adv_headline: 'Data Processing Aggreement',
  adv_text_question: 'Why should I care?',
  adv_text_answer: 'Starting with 25th May 2018, the European Union has added a new law for processing personal data, the so called "Datenschutz-Grundverordnung" (DSGVO)',
  adv_text_help: 'As an event organizer you are responsible for the personal data of your participants in terms of data protection. Due to we cannot ensure that you ' +
      'process the data only for personal and/or family-related purposes, ' +
      'you need to aggree to the <a href="/resources/AV-Vereinbarung.pdf" class="actionlink" target="_blank">Data Processing Terms (DE)</a>, which provides the legal protection ' +
      'for you as the event organizer and us as the service provider.',
  adv_text_address_help: 'In order to be compliant with the Data Processing Terms, you have to enter your address data.<br>\n' +
      '<strong>Important: We will never make your data public and we will use it only for running our service.</strong>',

  finish: 'Finish!',
  done: '... Done!',
  administration_link: 'Administration link',

  wizard_step_basics: 'Basics',
  wizard_step_options: 'Details',
  wizard_step_mealtimes: 'Schedule',
  wizard_step_public_registration: 'Public Registration',
  wizard_step_participant_preview: 'Participants Preview',
  wizard_step_finish: 'Finish',

  wizard_demo_mode_text: 'Demo mode: All settings are preassigned, but you can change them.' +
      '<br /><strong>Note:</strong> Public dinner events will not be published in demo mode.',

  wizard_create_title: 'Create new Running Dinner Event!'
};
export default Wizard_en;
