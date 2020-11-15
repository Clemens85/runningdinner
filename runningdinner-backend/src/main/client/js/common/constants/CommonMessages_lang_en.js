angular.module('rd.common.constants').constant('CommonMessages_lang_en', {

  feedback_label: 'Feedback & Help',
  feedback_text: 'Do you miss something or do you have an issue? Or do you just want to give some feedback?<br><br>' +
      'You will get as soon as possible a response to your entered email address.',
  feedback_pricacy_text: 'Information about privacy: <a href="{{ impressumLink }}" target="_blank">Privacy Statement (DE)</a>',

  registration_type: 'Visibility',

  validation_error_desc: 'Some input fields are not yet correct, please check the red marked fields',
  generic_error_label: 'There occurred an unexpected error',

  headline_participantlist: 'Participants',

  participants: 'Participants',

  add: 'Add',

  select_prompt: 'Please select...',

  congratulation: 'Congratulations!',

  address: 'Address',
  address_remarks: 'Remarks / Bell at',
  address_remarks_placeholder: 'Fill only for special remarks',

  back_to_form: 'Back to form',
  continue_dismiss: 'Continue without saving changes',

  content: 'Content',

  base_data: 'Personal information',
  address_data: 'Your address',
  mealspecifics: 'Eating habits',
  misc: 'Miscellaneous',
  misc_notes:'Other remarks',
  mealnotes: 'Further remarks',
  teampartner_wish: 'Team partner wish (email)',

  actions: 'Actions',
  label_edit: 'Edit',
  preview: 'Preview',
  save: 'Save',
  cancel: 'Cancel',
  reset: 'Reset',
  back: 'Back',
  change: 'Change',
  close: 'Close',
  details: 'Details',
  delete: 'Delete',
  next: 'Next',
  note: 'Note',
  time: 'Time',
  uhr: '',
  with_you: '(with you)',
  host: 'Host',

  email: 'Email',
  firstname: 'Firstname',
  lastname: 'Lastname',
  mobile: 'Mobile number',
  age: 'Age',
  zip: 'Zip',
  zip_help: 'For public events the zip will be displayed. For closed events the zip has no relevance.',
  city: 'City',
  street: 'Street',
  street_nr: 'Street number',
  title: 'Title',
  title_help: 'Only used for internal display',
  date: 'Date',
  fullname: 'Fullname',
  number_seats: 'Number of seats',
  recipient: 'Recipient',
  failure: 'Failure',
  schedule: 'Schedule',

  no_thanks: 'No, thanks',
  recommended: 'recommended',

  participant_seats: '{{numSeats}} seats',

  team_members: 'Team members',

  description: 'Description',

  gender: 'Gender',
  gender_female: 'Female',
  gender_male: 'Male',

  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  lactose: 'Lactose free',
  gluten: 'Gluten free',

  no_information: 'No information',

  public_end_of_registration_date: 'Registration deadline',
  public_dinner_link: 'Public link',
  public_description: 'Public description',
  public_title: 'Public title',

  contact: 'Contact',
  organizer: 'Contact person',
  public_contact_name: 'Contact person',
  public_contact_email: 'EMail address for questions of participants (will be displayed in event)',
  public_contact_mobile_number: '(Optional) Mobile number for questions of participants (will be displayed in event)',

  public_contact_name_help: 'Name of a contact person',
  public_contact_email_help: 'EMail address for questions of participants',
  public_contact_mobile_number_help: '(Optional) Mobile number for questions of participants (will be displayed in event)',

  registration_type_closed: 'Closed event: No registration possible',
  registration_type_open: 'Hidden event: Registration by using hidden link',
  registration_type_public: 'Public event: Everyone can register',

  participant_already_registered: 'This EMail is already used by another participant.',
  participant_email_equals_team_partner_wish: 'You cannot enter yourself as your wished team partner',

  fullname_invalid: 'Fullname is not valid',
  address_street_nr_invalid: 'Street is not valid',

  feedback_success: 'Thanks, your feedback was successfully submitted!',

  participant_activation_invalid_demo_dinner: 'Registration cannot be confirmed due to this event is a demo event. ' +
      'Registrations can only successfully be performed on non-demo events.',

  endOfRegistrationDate_help: 'Typically the deadline should be some days before the event.',
  public_title_help: 'This title should be quite meaningful',
  error_endofregistrationdate_invalid: 'Deadline must not be after the event (-> Basic settings for your event date)',
  error_date_invalid: 'Dinner date must not be in past',

  registration_deactivated_text: 'Registration is currently deactivated!',

  newsletter_label: 'Please send me updates about the runyourdinner-software by EMail.<br />' +
      'Of course we will not abuse your EMail address with spam. <br/>' +
      'You can anytime revoke this voluntary aggreement by sending an EMail to {{ globalAdminEmail }}.',

  loading: 'Loading data ...',

  settings: 'Settings',

  meals: 'Meals',
  meal: 'Meal',
  appetizer: 'Appetizer',
  main_course: 'Main course',
  dessert: 'Dessert',

  overview: 'Overview',
  hidden_link: 'Hidden link',
  hidden_link_text: 'Hidden link for registration:',
  on_date: 'on',
  at_time: 'at',

  show_details: 'Show details',

  single_selection: 'Single selection',

  event_language_label: 'Preset language',
  event_language_help: 'When creating a hidden or public dinner event, then this language will be preset when a user opens the event.' +
      'It is quite reasonable to choose e.g. English when your event will be performed in a non-german speaking community.',

  example: 'Example',
  quickstart: 'Quick start',
  features: 'Features',
  open_wizard: 'Open Wizard',
  visibilities: 'Visibility types',
  team_arrangements: 'Team Arrangements',

  dinner_route: 'Dinner-Route',

  registrationtype_closed: 'Closed',
  registrationtype_open: 'Hidden / Secret Link',
  registrationtype_public: 'Public',

  registrationtype_closed_description: 'Nobody can see the event. Only you can add your participants (no registration possible).',
  registrationtype_open_description: 'The event is not public visible, but participants can registrate themself by using a secret link that you distribute to all your friends.',
  registrationtype_public_description: 'The event is public visible and everybody can register to the event.',

  registration: 'Registration',

  imprint: 'Imprint & Privacy',
  create_running_dinner: 'Create Running Dinner',
  news: 'News',

  team_partner_wish_disabled: '<i>Disable</i> team partner wish feature',
  team_partner_wish_disabled_help: 'When deactivating this feature your participants cannot choose a team partner wish.' +
      'Most often you want however to provide the possiblity for participants to do so, hence you should only deactivate this feature,' +
      ' if you want to prevent partner wishes.',

  x: 'x'
});
