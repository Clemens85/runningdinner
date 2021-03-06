
angular.module('rd.admin.constants').constant('AdminMessages_lang_de', {

  address_data: 'Adresse',

  cancelled: 'Abgesagt',

  confirmation_unsaved_data_text: 'Du hast noch nicht gespeicherte Änderungen. Willst du fortfahren und die Daten verwerfen oder zurück zum Formular?',
  confirmation_unsaved_data_title: 'Achtung',

  dismiss_save: 'Änderungen verwerfen',

  headline_teams: 'Teams',

  selection_all: 'Alle selektieren/deselektieren',
  teams_selection: 'Team-Auswahl',
  participants_selection: 'Teilnehmer-Auswahl',

  gender_unknown: 'Geschlecht nicht bekannt',

  label_participant_edit_success: 'Teilnehmer erfolgreich bearbeitet!',

  teampartner_placeholder: 'Email des Wunschpartners',

  team_partner_wish_help: 'Will dieser Teilnehmer zusammen mit einem/einer Freund/in kochen? ' +
      'Durch Angabe der Email-Adresse wird sicher gestellt, dass beide als Team kochen wenn die Teams ausgelost werden.',

  team_partner_wish_not_existing_text: 'Du hast <strong>{{ teamPartnerWish }}</strong> als Wunschpartner angegeben, welcher noch nicht in deinem Event existiert',
  team_partner_wish_not_existing_send_email_text: 'Willst du eine Einladungs-Mail an diesen Wunschpartner versenden?',
  team_partner_wish_not_existing_create_public_text: 'Oder willst du alternativ diesen Wunschpartner nun direkt selbst anlegen?',
  team_partner_wish_not_existing_create_closed_text: 'Willst du diesen Wunschpartner nun direkt anlegen?',
  team_partner_wish_send_invitation_email: 'Einladungs-Mail versenden',
  team_partner_wish_create: 'Wunschpartner anlegen',
  team_partner_wish_add: 'Als Wunschpartner eintragen',
  team_partner_wish_existing_text: 'Du hast <strong>{{ matchingParticipant }}</strong> als Wunschpartner angegeben. <br/><br/>' +
      '<strong>{{ matchingParticipant }}</strong> existiert bereits in deinem Event.<br/>' +
      'Soll bei <strong>{{ matchingParticipant }}</strong> ebenfalls <strong>{{ participant }}</strong> als Wunschpartner eingetragen werden?',

  dinner_not_possible: 'Mit den aktuellen Einstellungen und der Teilnehmerliste kann kein Running Dinner erstellt werden. Sehr wahrscheinlich gibt es zu wenig Teilnehmer.',

  open_dinner_link_help: 'Jeder der diesen Link kennt, kann sich zu deinem Event anmelden. Du kannst diesen an deine Bekannten zur Anmeldung weitergeben.',

  admin_activities_headline: 'Deine Aktivitäten',

  checklist_create_dinner: 'Running Dinner erstellen',
  checklist_send_participant_messages: 'Nachrichten an Teilnehmer versenden',
  checklist_create_teamarrangements: 'Team Einteilungen vornehmen',
  checklist_send_team_messages: 'Teameinteilungs Emails versenden',
  checklist_send_dinnerroute_messages: 'Dinner-Routen versenden',
  checklist_end_of_registrationdate: 'Ende der Anmeldephase abwarten',
  checklist_end_of_registrationdate_days_left: 'Noch {{ days }} Tage',

  mails_subject: 'Betreff',
  mails_message: 'Nachricht',
  mails_template_help: 'Benutze folgende Templates',
  mails_team_sendmessage_headline: 'Team-Einteilung Benachrichtigung',
  mails_sendteams_host: 'Nachricht für Gastgeber',
  mails_sendteams_nonhost: 'Nachricht für Nicht-Gastgeber',
  mails_template_sendteams_message: 'Hallo {firstname} {lastname},\n\ndein(e) Tempartner ist/sind:\n\n{partner}.\n\n' +
                                    'Ihr seid für folgende Speise verantwortlich: {meal}.\nDiese soll um {mealtime} eingenommen werden.\n\n{host}\n\n' +
                                    'Alternativ kann jeder von euch die Gastgebereinteilung bis zur endgültigen Festlegung der Dinnerrouten unter folgendem Link selbst ändern:\n{managehostlink}\n' +
                                    'Sprecht euch hierfür jedoch bitte untereinander ab!',
  mails_template_sendteams_host: 'Es wird vorgeschlagen, dass du als Gastgeber fungierst. Wenn dies nicht in Ordnung ist, dann sprecht euch bitte ab und gebt uns Rückmeldung wer als neuer Gastgeber fungieren soll.',
  mails_template_sendteams_nonhost: 'Als Gastgeber wurde {partner} vorgeschlagen.',
  mails_template_replacement_host: 'Dieser Block ersetzt oben den {host} Platzhalter für den Teilnehmer der als Gastgeber fungiert.',
  mails_template_replacement_route_host: 'Dieser Block ersetzt oben den Teil des {route} Platzhalters für das Gastgeber-Team.',
  mails_template_replacement_route_guest: 'Dieser Block ersetzt oben den Teil des {route} Platzhalters für die Teams die besucht werden',
  mails_template_replacement_nonhost: 'Dieser Block ersetzt oben den {host} Platzhalter für den Teilnehmer der kein Gastgeber ist.',
  mails_team_sendmessage_button: 'Team-Einteilungen verschicken!',
  mails_template_sendparticipants_message: 'Hallo {firstname} {lastname},\n\n *DEIN TEXT*',
  mails_participant_sendmessage_button: 'Rundmail an Teilnehmer',
  mails_participant_sendmessage_headline: 'Teilnehmer Mail Versand',
  mails_template_senddinnerroute_message: 'Hallo {firstname},\n\nhier ist eure Dinner-Route: \n\n{route}\n\nUnter folgendem Link findet ihr jederzeit eine Live-Ansicht eurer Dinner-Route:\n{routelink}\n\nBitte versucht euch an die Zeitpläne zu halten!',
  mails_template_senddinnerroute_self: '{meal} bei EUCH\nGekocht wird bei {firstname} {lastname}\nUhrzeit: {mealtime} Uhr\n{mealspecifics}',
  mails_template_senddinnerroute_hosts: '{meal}\nWird gekocht bei: {firstname} {lastname}\n{hostaddress}\nUhrzeit: {mealtime} Uhr',
  mails_template_help_description: 'Beim Versand werden diese Platzhalter durch die Daten jedes einzelnen Teilnehmers ersetzt. Wie das Endergebnis aussieht, siehst du in der Vorschau.',
  mails_senddinnerroute_self: 'Eigene Speisen-Beschreibung in der Route',
  mails_senddinnerroute_hosts: 'Speisen-Beschreibung der zu besuchenden Gastgeber in der Route',
  mails_senddinnerroute_sendmessage: 'Dinner-Routen verschicken',

  mails_send_to_dinner_owner: 'Test-Email(s) erfolgreich versandt. Bitte überprüfe dein EMail-Postfach.',

  messages_send_general: 'Nachrichten schicken',
  messages_send_teams: 'Team-Einteilungen...',
  messages_send_dinnerroutes: 'Dinner-Routen...',
  messages_send_participants: 'Nachricht an Teilnehmer',

  mealtimes_updated_success: 'Zeitplan erfolgreich geändert!',
  attention: 'Achtung!',
  attention_mealtimes_messages_already_sent: 'Denke daran, dass du eine neue Rund-Email an deine Teilnehmer schicken solltest, falls du jetzt den Zeitplan änderst.',

  participant_new: 'Neuer Teilnehmer',
  // participant_edit_success: 'Änderungen an {{ fullname }} gespeichert!',
  // participant_create_success: '{{ fullname }} erfolgreich hinzugefügt!',
  participant_save_success: '{{ fullname }} erfolgreich gespeichert!',
  participant_empty_selection: 'Bitte wähle einen Teilnehmer aus um dessen Details zu sehen bzw. zu bearbeiten!',

  fill_with_example_data: 'Mit Musterdaten befüllen',

  participants_not_enough: 'Nicht genügend Teilnehmer',
  participants_no_existing: 'Keine Teilnehmer vorhanden',
  participants_no_existing_text: 'Bis jetzt gibt es noch keine (angemeldeten) Teilnehmer. Du kannst jedoch auch manuell Teilnehmer hinzufügen von denen du weisst, dass sie teilnehmen wollen.',
  participants_remaining_not_assignable_text: 'Folgende Teilnehmer können nicht in Teams eingeteilt werden und befinden sich daher momentan auf der Warteliste.',
  participants_remaining_not_assignable_headline: 'Warteliste',

  participants_all_assignable_text: 'Herzlichen Glückwunsch, du kannst alle aufgelisteten Teilnehmer in dein Running Dinner unterbringen.',
  participants_all_assignable_headline: 'Warteliste leer',

  participant_subscription_activation_manual: 'Manuell bestätigen...',
  participant_deletion_confirmation_headline: '{{ fullname }} wirklich löschen?',
  participant_deletion_confirmation_text: 'Alle Daten von {{ fullname }} werden unwiederbringlich gelöscht.',
  participant_deletion_confirmation_team_hint: 'Da dieser Teilnehmer bereits in einem Team eingeteilt ist, wird zunächste eine Absage durchgeführt.',
  participant_deletion_success_text: '{{ fullname }} erfolgreich gelöscht!',
  participant_cancel: 'Absagen...',

  participant_search_placeholder: 'Suche nach Name, Email oder Adresse',
  participants_number: '<strong>{{ numberParticipants }}</strong> Teilnehmer',
  participants_number_waiting_list: ' (davon {{ numRemainingNotAssignableParticipants }} auf Warteliste)',

  participant_teampartnerwish_sent_invitation: 'Einladung an {{ email }} erfolgreich versandt',
  participant_teampartnerwish_new_participant: 'Bitte gib alle fehlenden Daten ein und klicke auf Speichern!',
  participant_teampartnerwish_update_participant: '{{ fullnameThis }} wurde ebenfalls als Wunschpartner bei {{ fullnameOther }} eingetragen.',

  participants_too_few_text: 'Leider gibt es noch nicht genügend Teilnehmer, damit ein Running Dinner statt finden kann. ' +
                'Es werden mindestens {{ minSizeNeeded }} Teilnehmer benötigt. Dir fehlen also noch mindestens {{ missingParticipants }} Teilnehmer.',

  team: 'Team {{ teamNumber }}',
  team_jump_link: 'Springe zu Team {{ teamNumber }}',
  team_host_saved: 'Neuer Gastgeber gespeichert',
  team_schedule: 'Ablaufplan',
  teams_no_valid_host: 'Kein Teilnehmer hat genügend Sitzplätze',
  teams_host: 'Gastgeber ist <strong>{{ host }}</strong>',
  teams_host_change: 'Gastgeber ändern',
  teams_no_selection: 'Bitte wähle ein Team aus um dessen Details zu sehen bzw. zu bearbeiten!',
  teams_reset: 'Teams neu generieren',
  teams_reset_success_text: 'Alte Team-Einteilungen verworfen und erfolgreich neue Teams generiert',
  teams_reset_confirmation: 'Willst du wirklich die Team-Einteilungen neu vornehmen? Alle bisherigen Teams werden verworfen und komplett neu (zufällig) eingeteilt.',
  teams_reset_hint_team_messages_sent: 'Du hast bereits Benachrichtigungen über die Team-Einteilungen versandt, denke daran die bisherigen Teams zu' +
      '        benachrichtigen (sofern noch nicht geschehen), dass die bereits versandten Team-Einteilungen nicht mehr gültig sind.' +
      '        <br>Anschließend solltest du Benachrichtigungen an die neu generierten Teams verschicken.',
  teams_reset_hint_dinnerroute_messages_sent: 'Du hast bereits Benachrichtigungen über die Dinner-Routen versandt. Wenn du jetzt die Team-Einteilungen neu generierst, dann werden sowohl\n' +
      '        die versandten Dinner-Routen als auch die existierenden Team-Einteilungen ungültig. Du solltest alle Teams (vorab) gründlich darüber informieren,\n' +
      '        bevor du diese Aktion durchführst.',
  teams_show_dinnerroute: 'Dinnerroute anzeigen',
  teams_drag_drop_hint: 'Du kannst per Drag &amp; Drop Teilnehmer zwischen den Teams tauschen.',
  team_replaced_text: '(Team wurde durch neue Teilnehmer ersetzt)',
  team_cancel: 'Absage des Teams...',
  team_message: 'Nachricht an Team',
  team_notify_cancellation: 'Alle betroffenen Teams benachrichtigen...',
  team_swap_success_text: '{{ fullnameSrc }} mit {{ fullnameDest }} ausgetauscht!',
  team_cancel_member_success_text: '{{ fullname }} wurde aus Team entfernt & gelöscht',

  teams_generate_deadline_open_info: 'Die Anmeldefrist für dein Dinner läuft noch bis zum {{ endOfRegistrationDate }}.',
  teams_generate_deadline_open_warning: 'Die Anmeldefrist für dein Dinner läuft noch bis zum {{ endOfRegistrationDate }}. Teameinteilung dennoch schon vornehmen?',

  participants_count_public_event: 'Aktuell sind <strong>{{ numParticipants }}</strong> Teilnehmer angemeldet.',
  participants_count_closed_event: 'Aktuell sind <strong>{{ numParticipants }}</strong> Teilnehmer in deinem Dinner vorhanden.',

  participants_count_sufficient: 'Damit würden sich aktuell <strong>{{ numExpectedTeams }}</strong> Teams ergeben. ' +
      'Es gibt <strong>{{ numNotAssignableParticipants }}</strong> Teilnehmer die nicht in Teams eingeteilt werden können.',

  participants_count_too_few: 'Derzeit reicht die Teilnehmeranzahl leider nicht aus um eine Teameinteilung vorzunehmen.',

  teams_generate: 'Teameinteilung vornehmen!',

  team_member_cancel: 'Absage von {{ teamMemberToCancel }}',
  team_member_cancel_info: 'Team-Mitglied <strong>{{ teamMemberToCancel }}</strong> wird unwiederbringlich entfernt, das Team bleibt jedoch bestehen.\n' +
      '      D.h. dass {{ remainingTeamMemberNames }} nun alleine kocht. Falls {{ remainingTeamMemberNames }} nicht mehr teilnehmen will,\n' +
      '      kannst du das ganze Team absagen.<br>\n' +
      '      Du kannst jedoch auch das Team mit Teilnehmern aus der Warteliste auffüllen (sofern vorhanden).',
  team_member_cancel_host_info: 'Da dieses Team-Mitglied Gastgeber war, wird ein anderes Team-Mitglied automatisch neuer Gastgeber.',
  team_member_cancel_whole_team: 'Da <strong>{{ teamMemberToCancel }}</strong> das letzte verbleibende Team-Mitglied ist, muss das komplette Team abgesagt\n' +
      '      werden. Dies kannst du im nächsten Schritt tun.',
  team_member_cancel_delete: 'Absagen &amp; Löschen',
  team_member_cancel_goto_team_cancel: 'Zur Team-Absage...',

  team_cancel_info_text: 'Wenn ein Team komplett ausfällt (weil z.B. alle Teilnehmer absagen), kannst du dieses mit Teilnehmern aus der Warteliste ' +
      'auffüllen, sofern genügend vorhanden sind. Ansonsten fällt die Speise dieses Teams aus.',

  team_cancel_info_headline_too_few_participants: 'Nicht genügend Teilnehmer auf der Warteliste um komplettes Team aufzufüllen!',
  team_cancel_info_text_too_few_participants: 'Du benötigst noch <strong>{{ numNeededParticipants }}</strong> zusätzliche Teilnehmer.<br>' +
      'Du kannst das Team nach Klick auf Weiter einfach komplett absagen.',

  team_cancel_info_headline_sufficient_participants: 'Genügend Teilnehmer auf der Warteliste vorhanden!',
  team_cancel_info_text_sufficient_participants: 'Wähle <strong>{{ teamSize }}</strong> neue Teilnehmer aus um {{ teamName }} zu ersetzen.',

  affected_hosting_teams: 'Betroffene Gastgeber-Teams',
  affected_guest_teams: 'Betroffene Gäste-Teams',
  team_cancel_remove_text: 'Folgende Teilnehmer werden aus {{ teamName }} entfernt...',
  team_cancel_replaced_by_text:'... und ersetzt durch folgende Teilnehmer:',

  text_host_saved: 'Gastgeber erfolgreich gespeichert!',

  team_cancel_complete_message: 'Da du keine bzw. nicht genügend Ersatzteilnehmer ausgewählt hast, wird die Speise <strong>{{ meal }}</strong> für Team {{ teamNumber }} komplett ausfallen.',
  team_cancel_complete_headline: 'Team {{ teamNumber }} komplett absagen?',
  team_cancel_replace_headline: 'Team {{ teamNumber }} ersetzen',
  invalid_size_replacement_participants_too_little: 'Zu wenig Teilnehmer ausgewählt',
  invalid_size_replacement_participants_too_many: 'Zu viele Teilnehmer ausgewählt',
  team_swap_violates_team_partner_wish: 'Das Tauschen dieser Team-Mitglieder würde mindestens einen Team-Partner-Wunsch verletzen, und ist daher geblockt. ' +
                                        'Falls du dies dennoch wirklich tun willst, musst du die Team-Partner-Wünsche der betroffenen Teilnehmer händisch entfernen',

  team_cancel_hint_dinnerroutes_sent: 'Du hast bereits Dinner-Routen-Benachrichtigungen versandt, daher solltest du alle betroffenen Teams im nächsten Schritt nach der Absage benachrichtigen.',
  team_cancel_hint_notify_teams: 'Die betroffenen Teams wissen noch nicht, dass Sie {{ teamName }} besuchen bzw. empfangen. ' +
      'Du kannst die betroffenen Teams dennoch im nächsten Schritt benachrichtigen, dass auf Ihrer Dinner-Route ein Team ausfallen wird.',

  team_cancel_replace_team_members: 'Team-Mitglieder ersetzen',
  team_cancel_button: 'Absagen',
  team_cancel_replace_team_members_success: '{{ cancelledOrReplacedTeam }} wurde erfolgreich durch neue Teilnehmer ersetzt.',
  team_cancel_success: '{{ cancelledOrReplacedTeam }} wurde komplett abgesagt.',

  settings_basics: 'Basis Einstellungen',
  settings_public_registration: 'Öffentliche Einstellungen',
  settings_cancel_event: 'Event absagen...',
  settings_saved_success: 'Einstellungen erfolgreich gespeichert',
  deactivate_registration: 'Registrierung deaktivieren',
  activate_registration: 'Registrierung aktivieren',
  deactivate_registration_confirmation_text: 'Willst du die Registrierung für dein Event wirklich deaktivieren? ' +
      'Danach kann sich kein Teilnehmer mehr anmelden (du kannst jedoch noch selbst manuell Teilnehmer hinzufügen).',
  activate_registration_confirmation_text: 'Willst du die Registrierung für dein Event wirklich wieder aktivieren? ' +
      'Danach können sich Teilnehmer wieder selbst anmelden.',

  event_cancel_headline: 'Running Dinner Event absagen',
  event_cancel_button: 'Endgültig absagen',
  event_cancel_text: '<p>Mit dieser Aktion sagst du das Event endgültig ab.</p>\n' +
            '          <p>Diese Aktion kann nicht rückgängig gemacht werden, tue dies daher nur wenn du dir sicher bist.</p>\n' +
            '          <p>Die Daten dieses Events werden innerhalb von 1-2 Tagen automatisch unwiderruflich gelöscht, solange kannst du dir die Daten noch anschauen.</p>',
  event_cancel_text_no_registration_hint: 'Nach Absage des Events können sich keine neuen Teilnehmer mehr anmelden.',
  event_cancel_send_messages_hint: 'Du solltest allen bereits angemeldeten Teilnehmern unmittelbar nach der Absage eine Nachricht schreiben, dass das Event nicht mehr statt findet; ' +
      'du wirst nach der Absage daher direkt in den Teilnehmer-Nachrichten-Versand weitergeleitet.',

  messagejob_type_participant: 'Teilnehmer-Versand',
  messagejob_type_team: 'Team-Versand',
  messagejob_type_dinner_route: 'Dinner-Routen-Versand',
  recipient_email: 'Empfänger Email-Adresse',

  participant_selection_text: 'Teilnehmer für Mailversand auswählen',
  team_selection_text: 'Teams für Mailversand auswählen',

  invalid_size_selected_participants_message_empty: "Du kannst Nachrichten nur verschicken wenn es mind. einen Empfänger gibt, mit der aktuellen Auswahl gibt es aber keinen einzigen Empfänger.",

  address_city_zip_invalid: 'PLZ muss mind. 4 Ziffern habenm',

  SENDING_NOT_FINISHED: 'Versand läuft...',
  SENDING_FINISHED_FAILURE: 'Versand mit Fehlern',
  SENDING_FINISHED_SUCCESS: 'Versand erfolgreich',

  synchronize_messagejobs_help: 'Es kann nicht garantiert werden, dass selbst bei einem erfolgreichen Versand alle Nachrichten wirklich bei den Empfängern ankommen. ' +
                                'Nachrichten können z.B. im Spam landen, oder es kann das Postfach voll sein, ... ' +
                                'RunYourDinner wird dies automatisch feststellen und dir solche Rückläufer anzeigen, allerdings kann das Stunden bis Tage dauern.',

  FAILURE_TYPE_INVALID_EMAIL: 'Ungültige EMail-Adresse',
  FAILURE_TYPE_BOUNCE: 'Bounce',
  FAILURE_TYPE_SPAM: 'Spam',
  FAILURE_TYPE_BLOCKED: 'Blockiert (z.B. vom Provider)',

  confirmation_activate_subscription_title: '{{ participantEmail }} wirklich manuell bestätigen?',
  confirmation_activate_subscription_text: 'Diese Aktion sollte nur dann durchgeführt werden wenn ein Teilnehmer die Bestätigungs-Email nicht erhalten hat, ' +
                                            'aber dennoch am Event teilnehmen möchte.<br/><br/><em>Es wird intern vermerkt, ' +
                                            'dass die Bestätigung durch den Veranstalter und nicht vom Teilnehmer selbst vorgenommen wurde.</em>',


  runningdinner_acknowledge_title: 'Running Dinner Event bestätigen',
  runningdinner_acknowledge_congratulation_title: 'Bestätigung erfolgreich',
  runningdinner_acknowledge_congratulation_text: 'Herzlichen Glückwunsch, du hast dich soeben als Ersteller dieses Running Dinner Events bestätigt. ' +
  'Damit kannst du alle Features (inkl. Nachrichtenversand) nutzen!',

  runningdinner_acknowledge_error_title: 'Fehler bei Bestätigung',
  runningdinner_acknowledge_error_text: 'Leider ist ein Fehler beim Versuch der Bestätigung deines Dinner Events aufgetreten. ' +
  'Versuche es bitte später erneut. <br/>' +
  'Falls der Fehler immer noch auftritt wende dich bitte an <a href="mailto:{{ adminEmail }}">{{ adminEmail }}</a>.',

  message_send_to_me: 'An mich versenden (Test)',
  send: 'Senden',

  checklist: 'Checkliste',
  time_schedule: 'Zeitplan',
  time_schedule_edit: 'Zeitplan bearbeiten',
  latest_registrations: 'Letzte Anmeldungen',
  registration_not_yet_confirmed: 'Anmeldung noch nicht bestätigt',
  no_registrations: 'Keine Anmeldungen',
  activities_none: 'Keine Aktivitäten vorhanden!',

  participant_selection_all: 'Alle',
  participant_selection_assigned_to_teams: 'Nur Teilnehmer in Teams',
  participant_selection_not_assigned_to_teams: 'Nur Teilnehmer auf Warteliste',
  participant_selection_single_selection: 'Einzelauswahl...',

  participant_selection_all_text: 'Alle <strong>{{ numberOfSelectedParticipants }}</strong> Teilnehmer ausgewählt',
  participant_selection_assigned_to_teams_text: '<strong>{{ numberOfSelectedParticipants }}</strong> in Teams eingeteilte Teilnehmer ausgewählt',
  participant_selection_not_assigned_to_teams_text: '<strong>{{ numberOfSelectedParticipants }}</strong> Teilnehmer ohne Teamzuweisung ausgewählt',
  participant_selection_single_selection_text: 'Ausgewählte Teilnehmer:',

  team_selection_all: 'Alle',
  team_selection_single_selection: 'Einzelauswahl...',

  team_selection_all_text: 'Alle <strong>{{ numTeams }}</strong> Teams ausgewählt',
  team_selection_single_selection_text: 'Ausgewählte Teams:',

  team_single_message_headline: 'Team-Einzelnachricht',
  team_cancellation_message_headline: 'Team-Absage Benachrichtigung',

  protocols: 'Protokolle',
  protocols_empty: 'Noch keine Nachrichten verschickt',
  protocols_last_update_text: 'Zuletzt aktualisiert am {{ lastPollDate }}',
  protocols_messages_size_text: '{{ numberOfMessageTasks }} Nachrichten',
  protocols_transfer_headline_prefix: 'Übertragungsliste für ',

  sending_started_at_text: 'Versand gestartet um',
  sending_finished_at_text: 'Versand beendet um',
  send_again: 'Erneut versenden',
  send_again_help_text: 'Du kannst vor dem erneuten Versand die Nachricht editieren und/oder eine andere Empfänger Email Adresse angeben.',
  transfer: 'Übertragung',

  goto_dashboard: 'Zum Dashboard',

  notification_dinner_cancellation_text: 'Du hast dieses Dinner-Event am {{ cancellationDate }} endgültig abgesagt. ' +
      'Bitte benachrichtige alle Teilnehmer sofern noch nicht geschehen. Alle Daten werden in den nächsten Tagen automatisch gelöscht!',

  notification_dinner_demo_mode: 'Du befindest dich im Demo-Modus. Du kannst hier alle Funktionalitäten testen. ' +
      'Alle Nachrichten werden an dich - und nicht an die realen Empfänger - versandt.',

  notification_dinner_acknowledge_required: 'Aktuell ist der Nachrichtenversand deaktiviert, da du noch nicht den per Mail versandten Bestätigungslink aufgerufen hast.',

  mails_send_participants_title: 'Mailversand an Einzelteilnehmer - Running Dinner Administration',
  mails_send_teams_title: 'Mailversand an Teams - Running Dinner Administration',
  mails_send_dinnerroutes_title: 'Dinnerrouten Versenden - Running Dinner Administration',
  mail_protocols: 'Mail Protokolle',
  confirmation_title: 'Bestätigung - Running Dinner Administration',

  dashboard: 'Übersicht'

});
