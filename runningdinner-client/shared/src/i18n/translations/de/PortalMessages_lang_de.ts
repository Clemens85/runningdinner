const PortalMessages_de: any = {
  // Navigation
  my_events: 'Meine Events',

  // PortalActivationPage
  portal_activation_loading: 'Deine Events werden geladen…',
  portal_activation_error: 'Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Zugangslink an.',

  // MyEventsPage
  my_events_title: 'Meine Events',
  my_events_empty: 'Noch keine Events auf diesem Gerät verknüpft – das ist völlig normal!',
  my_events_empty_intro: 'Diese Seite zeigt dir alle Running-Dinner-Events, an denen du als Teilnehmer:in oder Veranstalter:in beteiligt bist.',
  my_events_empty_how_to_get_access: 'Wie bekomme ich Zugang zu meinen Events?',
  my_events_empty_how_to_hint:
    'Falls du dich bereits für ein Running Dinner angemeldet oder eines erstellt hast, gib einfach deine E-Mail-Adresse ein. ' +
    'Wir schicken dir dann einen persönlichen Zugangslink, um deine Events auf diesem Gerät einzusehen.',
  my_events_error: 'Deine Events konnten nicht geladen werden. Bitte versuche es erneut.',

  // PortalEventEntry / role badges
  role_participant: 'Teilnehmer:in',
  role_organizer: 'Veranstalter:in',
  manage_event: 'Event verwalten',
  view_event_page: 'Event-Seite ansehen',

  // AccessRecoveryForm
  access_recovery_missing_event_link: 'Fehlt ein Event?',
  access_recovery_missing_event_hint: 'Fordere einen Zugangslink mit der E-Mail-Adresse an, mit der du dich für das Event angemeldet oder es erstellt hast.',
  access_recovery_email_label: 'Deine E-Mail-Adresse',
  access_recovery_email_placeholder: 'email@beispiel.de',
  access_recovery_submit: 'Zugangslink anfordern',
  access_recovery_success: 'Falls unter dieser E-Mail-Adresse Events registriert sind, erhältst du in Kürze einen Wiederherstellungslink.',
  access_recovery_error: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',

  // ForgetMeButton
  forget_me_button: 'Auf diesem Gerät vergessen',
  forget_me_dialog_title: 'Auf diesem Gerät vergessen',
  forget_me_dialog_text:
    'Dies entfernt deinen Portalzugang von diesem Gerät und invalidiert deinen Portallink dauerhaft. ' +
    'Deine Anmeldungen und Event-Daten auf dem Server sind NICHT betroffen. ' +
    'Du kannst jederzeit einen neuen Zugangslink über das Wiederherstellungsformular anfordern.',
  forget_me_dialog_confirm: 'Vergessen',
  forget_me_dialog_cancel: 'Abbrechen',

  // Participant event card action
  view_participation: 'Meine Teilnahme',

  // ParticipantSelfServicePage — general
  participant_event_back: 'Zurück zu Meine Events',

  // ParticipantSelfServicePage — My Team section
  participant_event_section_team: 'Mein Team',
  participant_event_team_pending: 'Die Teams wurden noch nicht eingeteilt. Sobald du einem Team zugewiesen bist, erscheinen hier weitere Informationen.',
  participant_event_team_meal: 'Speise',
  participant_event_team_host: 'Gastgeber',
  participant_event_team_host_self_badge: 'Du bist der Gastgeber',
  participant_event_team_partner: 'Team-Partner',
  participant_event_manage_team_hosting: 'Gastgeber verwalten',

  // ParticipantSelfServicePage — Dinner Route section
  participant_event_section_dinnerroute: 'Dinner Route',
  participant_event_dinnerroute_pending: 'Die Dinner Routen wurden noch nicht verschickt. Deine persönliche Route erscheint hier, sobald der Veranstalter sie verteilt hat.',
  participant_event_view_dinnerroute: 'Meine Dinner Route ansehen',

  // ParticipantSelfServicePage — Messages section
  participant_event_section_messages: 'Nachrichten',
  participant_event_messages_empty: 'Noch keine Nachrichten vom Veranstalter.',
  participant_event_messages_intro: 'Alle E-Mails, die der Veranstalter dir schickt – z.B. deine Team-Zuteilung und Dinner Route – sind auch hier abrufbar.',
  participant_event_msg_type_participant: 'Teilnehmer-Info',
  participant_event_msg_type_team: 'Team-Info',
  participant_event_msg_type_dinnerroute: 'Dinner Route',
};

export default PortalMessages_de;
