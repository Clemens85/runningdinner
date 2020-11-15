angular.module('rd.common.constants').constant('CommonMessages_lang_de', {

  feedback_label: 'Feedback & Hilfe',
  feedback_text: 'Fehlt dir etwas oder hast du ein Anliegen? Oder willst du einfach nur generell Feedback loswerden?<br><br>' +
      'Hier hast du die Gelegenheit dazu. Du wirst baldmöglichst eine Antwort an deine angegebene EMail-Adresse erhalten.',
  feedback_pricacy_text: 'Hinweise zur Verarbeitung deiner Angaben und Widerspruchsrechte: <a href="{{ impressumLink }}" target="_blank">Datenschutzerklärung</a>',

  registration_type: 'Sichtbarkeit',

  validation_error_desc: 'Ein paar Eingaben sind noch nicht ganz korrekt, bitte prüfe die Einträge in den rot markierten Feldern.',
  generic_error_label: 'Es ist ein unbekannter Fehler aufgetreten',

  headline_participantlist: 'Teilnehmerliste',

  participants: 'Teilnehmer',

  add: 'Hinzufügen',

  select_prompt: 'Bitte auswählen...',

  address: 'Adresse',
  address_remarks: 'Anmerkungen / Klingeln Bei',
  address_remarks_placeholder: 'Nur ausfüllen bei Besonderheiten',

  back_to_form: 'Zurück zum Formular',
  continue_dismiss: 'Fortfahren und Änderungen verwerfen',

  congratulation: 'Herzlichen Glückwunsch!',

  content: 'Inhalt',

  base_data: 'Persönliche Angaben',
  address_data: 'Deine Behausung',
  mealspecifics: 'Essens-Wünsche',
  misc: 'Sonstiges',
  misc_notes:'Sonstige Anmerkungen',
  mealnotes: 'Weitere Bemerkungen',
  teampartner_wish: 'Wunschpartner (EMail)',

  actions: 'Aktionen',
  label_edit: 'Bearbeiten',
  preview: 'Vorschau',
  save: 'Speichern',
  cancel: 'Abbrechen',
  reset: 'Reset',
  back: 'Zurück',
  change: 'Ändern',
  close: 'Schließen',
  details: 'Details',
  delete: 'Löschen',
  next: 'Weiter',
  note: 'Hinweis',
  time: 'Uhrzeit',
  uhr: 'Uhr',
  with_you: '(bei euch)',
  host: 'Gastgeber',

  email: 'Email',
  firstname: 'Vorname',
  lastname: 'Nachname',
  mobile: 'Handy-Nr',
  age: 'Alter',
  zip: 'PLZ',
  zip_help: 'Ohne Bedeutung bei geschlossenen Veranstaltungen, bei öffentlichen Veranstaltungen wird PLZ und Stadt jedoch veröffentlicht.',
  city: 'Ort',
  street: 'Straße',
  street_nr: 'Hausnummer',
  title: 'Titel',
  title_help: 'Dient ausschließlich zur internen Darstellung',
  date: 'Datum',
  fullname: 'Vollständiger Name',
  number_seats: 'Anzahl Plätze',
  recipient: 'Empfänger',
  failure: 'Fehler',
  schedule: 'Ablauf',

  no_thanks: 'Nein, danke',
  recommended: 'empfohlen',

  participant_seats: '{{numSeats}} Plätze',

  team_members: 'Team Mitglieder',

  description: 'Beschreibung',

  gender: 'Geschlecht',
  gender_female: 'Weiblich',
  gender_male: 'Männlich',

  vegetarian: 'Vegetarisch',
  vegan: 'Vegan',
  lactose: 'Laktosefrei',
  gluten: 'Glutenfrei',

  no_information: 'Keine Angabe',

  public_end_of_registration_date: 'Anmeldeschluss',
  public_dinner_link: 'Öffentlicher Link',
  public_description: 'Öffentliche Beschreibung',
  public_title: 'Öffentlicher Titel',

  contact: 'Kontakt-Infos',
  organizer: 'Veranstalter',
  public_contact_name: 'Kontakt',
  public_contact_email: 'EMail für Rückfragen (wird in Event angezeigt)',
  public_contact_mobile_number: '(Optional) Handy-Nr für Rückfragen (wird in Event angezeigt)',

  public_contact_name_help: 'Name eines Ansprechpartners',
  public_contact_email_help: 'Email-Adresse für Rückfragen',
  public_contact_mobile_number_help: 'Optionale Angabe: Handy-Nr für Rückfragen',

  registration_type_closed: 'Keine öffentliche Anmeldung möglich',
  registration_type_open: 'Anmeldung via geheimen Link möglich',
  registration_type_public: 'Öffentliche Anmeldung möglich',

  loading: 'Daten werden geladen...',

  settings: 'Einstellungen',

  participant_already_registered: 'Es ist bereits ein Teilnehmer unter dieser Email Adresse registriert',
  participant_email_equals_team_partner_wish: 'Du kannst dich nicht selbst als Wunschpartner angeben',

  fullname_invalid: 'Der Name ist ungültig',
  address_street_nr_invalid: 'Die Straße ist ungültig',

  feedback_success: 'Vielen Dank für dein Feedback, es wurde erfolgreich übermittelt!',

  participant_activation_invalid_demo_dinner: 'Registrierung kann nicht bestätigt werden, da es sich hierbei um ein Demo-Event handelt. ' +
                                              'Eine Registrierung wird nur bei echten Events angenommen.',

  endOfRegistrationDate_help: 'Sollte typischerweise ein paar Tage vor dem Veranstaltungstag sein',
  public_title_help: 'Sollte möglichst aussagekräftig sein',
  error_endofregistrationdate_invalid: 'Anmeldeschluss darf nicht nach Datum des Events liegen (siehe Einstellungen)',
  error_date_invalid: 'Das Datum darf nicht in der Vergangenheit liegen',

  registration_deactivated_text: 'Registrierung vorübergehend deaktiviert!',

  newsletter_label: 'Bitte halte mich per E-Mail mit Neuigkeiten zu der runyourdinner-Software auf dem Laufenden.<br/>' +
                    'Wir spammen dich natürlich nicht zu. <br/>' +
                    'Deine freiwillige Einwilligung kannst du trotzdem jederzeit per E-Mail an {{ globalAdminEmail }} widerrufen.',

  meals: 'Speisen',
  meal: 'Speise',

  appetizer: 'Vorspeise',
  main_course: 'Hauptgericht',
  dessert: 'Dessert',

  overview: 'Übersicht',
  hidden_link: 'Geheimer Link',
  hidden_link_text: 'Geheimer Link zur Event-Registrierung:',
  on_date: 'am',
  at_time: 'um',

  show_details: 'Details anzeigen',

  single_selection: 'Einzelauswahl',

  event_language_label: 'Voreingestellte Sprache',
  event_language_help: 'Wenn du ein verstecktes oder öffentliches Dinner veranstaltest, dann wird diese Sprache beim Öffnen des Events voreingestellt. ' +
      'Wenn dein Event z.B. im nicht-deutschsprachigem Raum statt findet, ist es sinnvoll hier Englisch auszuwählen.',

  example: 'Beispiel',
  quickstart: 'Schnelleinstieg',
  features: 'Funktionalitäten',
  open_wizard: 'Wizard öffnen',
  visibilities: 'Sichtbarkeiten',
  team_arrangements: 'Team-Einteilung',

  dinner_route: 'Dinner-Route',

  registrationtype_closed: 'Geschlossen',
  registrationtype_open: 'Versteckt / Geheim-Link',
  registrationtype_public: 'Öffentlich',

  registrationtype_closed_description: 'Niemand sieht das Event und nur du alleine trägst deine Teilnehmer ein.',
  registrationtype_open_description: 'Das Event ist nicht sichtbar, aber Teilnehmer können sich über einen (geheimen) Link selbst registrieren.',
  registrationtype_public_description: 'Das Event ist öffentlich sichtbar und jeder kann an dem Event teilnehmen.',

  registration: 'Anmeldung',

  imprint: 'Impressum & Datenschutz',
  create_running_dinner: 'Running Dinner Veranstalten',
  news: 'Neuigkeiten',

  team_partner_wish_disabled: 'Wunschpartner-Funktionalität <i>deaktivieren</i>',
  team_partner_wish_disabled_help: 'Wenn du diesen Haken setzt, dann können Teilnehmer bei der Anmeldung keine Wunsch-Partner angeben. ' +
      'Meistens ist aber genau das gewünscht, daher solltest du diese Funktion nur deaktivieren, wenn du dies explizit verhindern willst.',


  x: 'x'
});
