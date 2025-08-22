const LandingMessages_de: any = {
  registration: 'Anmeldung',

  number_seats_placeholder: 'Für wie viele Personen hast du Platz in deiner Wohnung?',
  misc_notes_placeholder: 'Willst du sonst noch etwas anmerken?',
  teampartner_placeholder: 'E-Mail deines Wunschpartners',

  registration_validate: 'Weiter',
  registration_perform: 'Jetzt Verbindlich Anmelden!',
  registration_finish: 'Anmeldung abschließen',
  registration_finish_check: 'Überprüfe nochmals deine Angaben:',
  registration_date_expired: 'Du kannst dich leider nicht mehr anmelden, da die Anmeldefrist abgelaufen ist.',

  registration_can_host: 'Du hast genügend Plätze um als Gastgeber am Event teilzunehmen',
  registration_no_host: 'Du hast nicht genügend Plätze um als Gastgeber teilzunehmen, daher wird versucht dich jemandem zuzulosen der genügend Plätze hat',

  registration_activation_title: 'Anmeldung bestätigen',
  registration_activation_congratulation_title: 'Bestätigung erfolgreich',
  registration_activation_congratulation_text:
    'Herzlichen Glückwunsch, du hast soeben deine Registrierung erfolgreich abgeschlossen und bist damit bei ' +
    '<strong><anchor href="{{ publicDinnerUrl }}" target="_blank">{{ publicDinnerTitle }}</anchor></strong> dabei! ' +
    '<br/>Du wirst demnächst nähere Infos vom Veranstalter (<anchor href="mailto:{{ adminEmail }}">{{ adminEmail }}</anchor>) bekommen.',
  registration_activation_with_teampartner_congratulation_text:
    'Herzlichen Glückwunsch, du hast soeben deine Registrierung für dich und deinen Partner {{ fullname }} erfolgreich abgeschlossen und bist damit bei ' +
    '<strong><anchor href="{{ publicDinnerUrl }}" target="_blank">{{ publicDinnerTitle }}</anchor></strong> dabei! ' +
    '<br/>Du wirst demnächst nähere Infos vom Veranstalter (<anchor href="mailto:{{ adminEmail }}">{{ adminEmail }}</anchor>) bekommen.',

  registration_activation_error_title: 'Fehler bei Bestätigung',
  registration_activation_error_text:
    'Leider ist ein Fehler beim Versuch der Bestätigung der Registrierung aufgetreten. ' +
    'Versuche es bitte später erneut. <br/>' +
    'Falls der Fehler immer noch auftritt wende dich bitte an <anchor href="mailto:{{ adminEmail }}">{{ adminEmail }}</anchor>.',

  registration_not_possible: 'Anmeldung nicht möglich',
  registration_not_possible_zip_restriction:
    'Deine Adresse scheint leider zu weit entfernt für eine Teilnahme an <strong>{{title}}</strong> zu sein.<br/>' +
    'Bitte wende dich mit deinen Daten an den Veranstalter, um zu klären, ob dennoch eine Teilnahme möglich ist.',

  registration_payment_error:
    'Leider ist etwas schief gelaufen. Versuche es bitte erneut in ein paar Minuten. Falls es immer noch nicht klappt, kontaktiere bitte den Veranstalter.',
  registration_not_possible_without_payment: 'Für dieses Event ist eine kostenpflichtige Anmeldung nötig.',
  registration_payment_continue: 'Weiter zur Bezahlung...',
  registration_payment_info:
    'Mit dem Kauf meldest du dich für dieses Event an.<br />' +
    'Im nächsten Schritt wirst du zu PayPal zur Bezahlung weitergeleitet.<br />' +
    'Schließe bitte nicht den Browser während des Bezahlvorgangs.',
  registration_payment_price_single: 'Kosten pro Anmeldung: {{ pricePerRegistration }} €',
  payment_processing: 'Zahlung wird verarbeitet, bitte Browser nicht schließen',
  payment_finalize: 'Kauf abschließen',
  payment_check_contact_data: 'Bitte überprüfe nochmals deine Kontaktdaten',
  payment_purchase_now: 'Jetzt kaufen',
  payment_with_paypal: 'Bezahlung mit PayPal',
  payment_teampartner_registrataion: 'Anmeldung mit Teampartner',
  payment_total_price: 'Preis {{ totalPriceFormatted }} €',
  payment_no_paypal_contact:
    'Du hast kein PayPal und möchtest dennoch teilnehmen? Melde dich bitte bei <anchor href="mailto:{{ publicContactEmail }}">{{ publicContactEmail }}</anchor>.',

  teampartner_wish_summary_not_existing:
    'Du hast <italic>{{ teamPartnerWish }}</italic> als Wunschpartner angegeben. ' +
    'Er oder Sie bekommt eine Einladung via E-Mail sobald du deine Registrierung bestätigt hast. ' +
    'Ihr werdet dann zusammen als Team kochen, wenn <italic>{{ teamPartnerWish }}</italic> sich anmeldet.',

  teampartner_wish_summary_match: 'Du wirst zusammen mit <italic>{{ teamPartnerWish }}</italic> als Team kochen.',

  teampartner_wish_summary: 'Du hast <italic>{{ teamPartnerWish }}</italic> als Wunschpartner angegeben.',

  gender_unknown: 'Keine Angabe',

  registration_finished_headline: 'Anmeldung abgeschlossen!',
  registration_finished_text:
    'Du hast dich soeben registriert. In den nächsten Minuten solltest du eine E-Mail mit einem Bestätigungslink und weiteren Infos erhalten. ' +
    '<br/>Um deine Anmeldung erfolgreich abzuschließen musst du diesen Link aufrufen. Solltest du keine E-Mail erhalten melde dich bitte an <anchor href="mailto:{{ adminEmail }}">{{ adminEmail }}</anchor>.',
  registration_finished_payment_text:
    'Du hast dich soeben registriert. In den nächsten Minuten solltest du eine E-Mail mit weiteren Infos erhalten. ' +
    '<br/>Solltest du keine E-Mail erhalten melde dich bitte an <anchor href="mailto:{{ adminEmail }}">{{ adminEmail }}</anchor>.',

  street_placeholder: 'Deine Strasse + Nr',
  address_remarks_help: 'Optional: Wenn deine Wohnung schwer zu finden ist, können diese Angaben anderen Teams helfen, falls du Gastgeber bist.',

  team_partner_wish_help:
    'Willst du zusammen mit einem/einer Freund/in kochen? ' +
    'Durch Angabe der E-Mail-Adresse bekommt dein(e) Freund(in) automatisch ' +
    'eine Einladung für dieses Event, sofern noch nicht angemeldet. ' +
    'Ihr werdet in ein Team eingeteilt.',

  misc_notes_help: 'Optional: Falls du sonst noch etwas los werden willst. Diese Anmerkungen landen ausschließlich beim Veranstalter des Events.',

  mealspecifics_summary_text: 'Du hast folgende Essens-Wuensche angegeben',

  dinner_event_not_found_text: 'Unter dieser URL gibt es kein Running Dinner Event!',
  dinner_event_deadline_text: 'Anmeldeschluss ist der {{ endOfRegistrationDate }}.',
  goto_registration: 'Zur Anmeldung',

  data_processing_acknowledge: 'Ich willige in die Verarbeitung meiner Daten ein.',
  data_processing_acknowledge_hint: 'Die <anchor href="{{ privacyLink }}" target="_blank">Datenschutzerklärung</anchor> enthält weitere Erläuterungen dazu.',

  notification_demo_no_registration_text: 'Dies ist kein echtes Event, sondern ein Demo-Event. Eine (Test-)Anmeldung ist zwar möglich, wird aber nicht angenommen.',

  public_dinner_events_headline: 'Öffentliche Running Dinner Events',
  public_dinner_events_empty_text: 'Derzeit gibt es keine öffentlichen Running Dinner Events. Du kannst dies ändern indem du selbst eines veranstaltest.',
  public_dinner_events_empty_headline: 'Keine Events gefunden!',
  public_dinner_events_empty_goto_wizard: 'Hier gehts zur Erstellung',

  for_organizers_headline: 'Für Veranstalter',

  create_event_headline: 'Eigenes Event erstellen',
  create_event_description:
    'Erstelle kinderleicht dein eigenes (privates) Running Dinner Event - ganz ohne Registrierung!<br/>' +
    'Ob für jeden sichtbar oder nur für deinen privaten Freundeskreis entscheidest du.',

  manage_event_headline: 'Event verwalten',
  manage_event_description:
    'Nachdem du dein Running Dinner erstellt hast, geht alles fast wie von alleine.\n' +
    'Sämtliche Vorgänge wie beispielsweise Team-Einteilungen, Routen-Berechnungen erledigt die Anwendung für dich.\n' +
    'Du kannst dennoch jederzeit eingreifen und beispielsweise vorgenommene Team-Einteilungen wieder umändern.',
  manage_event_link: 'Alle Funktionen der Event-Verwaltung',

  manage_event_party_headline: 'Event durchführen & genießen',
  manage_event_party_description:
    'Dir werden alle lästigen und komplizierten Arbeiten zur Organisation eines Running Dinner Events abgenommen,\n' +
    'wie beispielsweise personalisierter E-Mail-Versand an die Teilnehmer / Teams.<br/>\n' +
    'Die Verantwortung der Durchführung des Events obliegt jedoch ganz alleine dir.<br/><br/>\n' +
    'Viel Spaß!',

  for_participants_headline: 'Für Teilnehmer',

  discover_public_events_headline: 'Entdecke öffentliche Events',
  discover_public_events_description:
    'Finde öffentliche Running Dinner Events in deiner Nähe und melde dich unkompliziert hierfür an!\n' +
    'Es ist keine Registrierung auf dieser Seite hierfür erforderlich, du meldest dich direkt beim Veranstalter an.',
  discover_public_events_link: 'Öffentliches Event finden...',

  public_events_no_event_found_headline: 'Kein öffentliches Event gefunden?',
  public_events_no_event_found_description:
    'Viele Veranstaltungen finden (halb-)privat statt.<br/>' +
    'Falls in deinem Bekanntenkreis eine Veranstaltung statt findet wurdest du entweder automatisch eingetragen, ' +
    'oder du hast einen geheimen Link zur Anmeldung bekommen (z.B. via Mail, Facebook, ...).<br/>' +
    'Benutze in diesem Fall diesen Link um zur Anmeldung zu kommen.',

  privacy_question_headline: 'Was passiert mit meinen Daten?',
  privacy_question_description:
    'Obwohl keine Registrierung oder Sonstiges erforderlich ist, ' +
    'so musst du doch einige persönliche Daten übermitteln die zur Veranstaltung eines Running Dinners benötigt werden.<br/>' +
    'Diese sind nur für den Veranstalter einsehbar und werden nach Veranstaltungsende wieder automatisiert gelöscht.',

  privacy_more_infos_link: 'Mehr Infos zum Datenschutz',

  teaser_what_is_running_dinner_headline: 'Was ist ein Running Dinner?',
  teaser_running_dinner_general_description:
    'Das Konzept eines Running Dinner wurde unter dem Namen "rudirockt - Kochen und Kontakte knüpfen" mehrfach ausgezeichnet ' +
    '(siehe <anchor href="https://www.wikipedia.de/" target="_blank" rel="noopener noreferrer">Wikipedia</anchor>).<br />' +
    'Es ist auch unter dem Namen Flying Dinner oder Jumping Dinner bekannt.',

  teaser_running_dinner_general_application:
    'Mit <strong>runyourdinner</strong> kannst du dein eigenes Running Dinner Event kinderleicht veranstalten. ' +
    'Oder du machst bei einem öffentlichen Event in deiner Nähe als Teilnehmer mit.',

  teaser_organize_event_text: 'Eigenes Event veranstalten',
  teaser_search_public_event_text: 'Öffentliches Event suchen',

  teaser_how_does_it_work: 'Wie funktioniert das?',

  teaser_workflow_team_generation: 'Alle Teilnehmer werden nach der Anmeldung in 2er Teams zusammen gelost.',
  teaser_workflow_team_meals: 'Jedes Team bekommt mitgeteilt für welche Speise (Vorspeise, Hauptgang, Nachtisch) es verantwortlich ist.',
  teaser_workflow_team_host: 'Die zugeteilte Speise wird in der Wohnung eines Teampartners gekocht.',
  teaser_workflow_team_guest: 'Es sind immer zwei andere Teams zu Gast (d.h. jedes Team kocht insgesamt für 6 Personen).',
  teaser_workflow_dinner_route: 'Nach dem Kochen der eigenen Speise geht es weiter zu einem anderen Team bis man alle Speisen eingenommen hat.',
  teaser_workflow_dinner_route_finish: 'Am Ende des Abends ist jedes Team auf 6 andere Teams getroffen.',

  teaser_example_appetizer: 'Die Vorspeise wird in der eigenen Wohnung eines Teams gekocht, in welcher dann zwei weitere Teams dazu stoßen.',
  teaser_example_main_course:
    'Nach dem Essen heißt es dann ruckzuck weiter in die nächste Küche, in der dieses Team zwei neue Koch-Teams kennenlernt.<br/>' +
    'Diesmal darf dieses Team also selbst Gast sein und zusammen mit einem weiteren Gast-Team die Hauptspeise des Gastgeber-Teams genießen.',
  teaser_example_dessert: 'Das gleiche Spiel folgt beim Dessert.',
  teaser_example_summary:
    'Jeder Gang wird folglich mit anderen Kochteams eingenommen, sodass jedes Team am Ende des Abends mit 12 verschiedenen Personen gegessen hat. ' +
    'Im Endeffekt wissen die jeweiligen Teams (hoffentlich) nicht wer zu Ihnen zu Besuch ist und die anderen Teams kennen nur die Gastgeber-Adresse.',

  create_your_own_event_hedline: 'Veranstalte dein eigenes Running Dinner Event',
  quickstart_description: 'Mit dem Wizard erstellst du mit wenigen Klicks ein neues Running Dinner Event.',
  uncertain_headline: 'Unsicher? Einfach mal schnell testen?',
  uncertain_description:
    'Kein Problem. Du kannst dir hier kinderleicht ein Running Dinner Event im Demo-Modus erstellen, bevor du mit einem "echten" Event loslegst. ' +
    '<br/>Damit kannst du bequem alle Funktionalitäten erst einmal testen und ein Gefühl dafür entwickeln, was du alles tun kannst.<br/>' +
    'Dieses Event siehst nur du und du kannst damit tun was du willst. Du kannst natürlich auch mehrere Demo Events anlegen zum austesten. ' +
    '<br/>Jedes Demo Event wird automatisch mit einigen Teilnehmern vorbefüllt, so dass du direkt alles testen kannst ohne mühsam einzelne Teilnehmer anlegen zu müssen. ' +
    'Selbstverständlich kannst du aber beliebig viele weitere Teilmnehmer hinzufügen.',

  create_demo_dinner_link: 'Demo Dinner erstellen',
  visibilities_text: 'Wähle zwischen 3 Sichtbarkeits-Stufen.',

  team_arrangements_meal_feature: 'Automatische Team-Einteilung und Zuweisung der Speisen',
  team_arrangements_distribution_feature: 'Einteilung zufällig oder nach bestimmten Kriterien (Geschlecht, ...)',
  team_arrangements_swap_feature: 'Bequemes Ändern der Einteilung via Drag & Drop möglich',

  dinner_route_calculation_feature: 'Optimale Berechnung der Dinner-Routen',
  dinner_route_view_feature: 'Anzeige der Dinner-Routen',
  dinner_route_googlemaps_feature: 'Google-Maps Integration',

  mail_sending_personalized: 'Personalisierter Mailversand',
  mail_sending_personalized_description: 'Flexibler + einfacher E-Mail-Versand mit indiviuellen E-Mails an jeden Empfänger.',

  mail_sending_personalized_participants: 'Versand an Teilnehmer',
  mail_sending_personalized_teams: 'Versand der Team-Einteilungen',
  mail_sending_personalized_dinnerroutes: 'Versand der Dinner-Routen',

  attention_mobilenumber_missing:
    'Du hast keine Handy-Nr angegeben. Um die Kontaktaufnahme zu erleichtern (z.B. wenn du Gastgeber bist), wäre es sehr hilfreich eine Nummer anzugeben. Wenn du das nicht möchtest, kannst du dich aber auch ohne Angabe anmelden.',

  participant_management_headline: 'Teilnehmer-Verwaltung',

  participant_management_crud_feature: 'Teilnehmer hinzufügen / bearbeiten / löschen',
  participant_management_overview_feature: 'Einfache Übersicht über alle Teilnehmer',
  participant_management_waitinglist_feature: 'Wartelisten-Funktion',

  participant_features: 'Teilnehmer-Funktionen',

  participant_feature_self_registrate: 'Selbst-Registrierung bei nicht-geschlossenen Events',
  participant_feature_change_host: 'Teams können Gastgeber-Zuweisung selbst ändern',
  participant_feature_live_dinnerroute: 'Live Dinner-Routen-Sicht',

  misc_feature_dashboard: 'Dashboard mit Aktivitäten-Verfolgung, Checkliste uvm.',
  misc_feature_new_participants: 'Überblick über neu registrierte Teilnehmer',
  misc_feature_cancel_teams: 'Umgang mit Absagen von Teams / Teilnehmern',
  misc_feature_team_partner_wish: 'Wunsch-Partner Handling',

  misc_feature_languages: 'Verfügbar auf Deutsch und Englisch',

  start_title: 'Programm zur Berechnung und Durchführung von Running Dinner Events',
  registration_finished_title: 'Registrierung abgeschlossen',
  registration_confirm_title: 'Registrierung bestätigen',
  create_wizard_title: 'Erstelle und verwalte dein eigenes Running Dinner',
  impressum_title: 'Impressum & Datenschutzerklärung',

  currentuser_already_registered_info: 'Du hast dich in diesem Browser bereits mit <italic>{{ email }}</italic> für dieses Event angemeldet.',
  currentuser_already_registered_cancel: 'Falls du dich abmelden willst, melde dich bitte per Mail an <anchor href="{{ email }}">{{ email }}</anchor>.',
  currentuser_already_registered_new_register: 'Falls du dich erneut anmelden willst, kannst du dies dennoch hier tun:',

  teampartner_registration_summary_info:
    'Du hast <italic>{{ firstname }} {{ lastname }}</italic> als Wunschpartner eingetragen. Damit werdet ihr automatisch als ein Team zusammen kochen.',
  teampartner_wish_section_title: 'Willst du zusammen mit einem/einer Freund/in kochen?',
  teampartner_wish_section_subtitle:
    'Hast du einen Wunschpartner mit dem du auf jeden Fall zusammen kochen möchtest? Du kannst diese Person entweder direkt hier mit anmelden oder alternativ via E-Mail zum Event einladen. ' +
    'Ihr werdet dann in ein Team eingeteilt.',
  teampartner_wish_invitation_info: 'Du wurdest von {{ invitingParticipantEmail }} zu diesem Event eingeladen. Ihr werdet zusammen als Team kochen.',
  x: 'x',
};

export default LandingMessages_de;
