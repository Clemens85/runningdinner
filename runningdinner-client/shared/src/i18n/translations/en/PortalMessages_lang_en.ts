const PortalMessages_en: any = {
  // Navigation
  my_events: 'My Events',

  // PortalActivationPage
  portal_activation_loading: 'Loading your events…',
  portal_activation_error: 'The link is invalid or has expired. Please request a new access link.',

  // MyEventsPage
  my_events_title: 'My Events',
  my_events_empty: 'No events linked to this device yet — that is perfectly normal!',
  my_events_empty_intro: 'This page shows all running dinner events you are part of, either as a participant or as an organizer.',
  my_events_empty_how_to_get_access: 'How do I get access to my events?',
  my_events_empty_how_to_hint:
    'If you have already registered for or created a running dinner, simply enter your email address below. ' +
    'We will send you a personal access link to view your events on this device.',
  my_events_error: 'Your events could not be loaded. Please try again.',

  // PortalEventEntry / role badges
  role_participant: 'Participant',
  role_organizer: 'Organizer',
  manage_event: 'Manage event',
  view_event_page: 'View event page',

  // AccessRecoveryForm
  access_recovery_missing_event_link: 'Missing an event?',
  access_recovery_missing_event_hint: 'Request an access link using the email address you used when registering for or creating the event.',
  access_recovery_email_label: 'Your email address',
  access_recovery_email_placeholder: 'email@example.com',
  access_recovery_submit: 'Send recovery link',
  access_recovery_success: 'If events are registered with this email address you will receive a recovery link shortly.',
  access_recovery_error: 'Something went wrong. Please try again.',

  // ForgetMeButton
  forget_me_button: 'Forget me on this device',
  forget_me_dialog_title: 'Forget me on this device',
  forget_me_dialog_text:
    'This will remove your portal access from this device and permanently invalidate your portal link. ' +
    'Your registrations and event data on the server are NOT affected. ' +
    'You can request a new access link at any time via the access recovery form.',
  forget_me_dialog_confirm: 'Forget me',
  forget_me_dialog_cancel: 'Cancel',
};

export default PortalMessages_en;
