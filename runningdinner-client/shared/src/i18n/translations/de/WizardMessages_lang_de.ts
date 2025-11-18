const Wizard_de: any = {
  basic_settings: 'Einstellungen',

  public_settings: 'Daten für die Veröffentlichung',

  email_administration_link_help:
    'Ein Link zur Administration wird an diese E-Mail-Adresse versandt. Diese Adresse wird als Absender benutzt wenn du Nachrichten an deine Teilnehmer verschickst.<br> ' +
    '<strong>Du erhälst außerdem einen Link zur Bestätigung, dass du wirklich der Ersteller dieses Events bist. ' +
    'Erst nach deiner Bestätigung werden alle Funktionalitäten (wie etwa der Nachrichtenversand) freigeschaltet!</strong>',
  administration_link_help:
    'Dieser Link sollte nicht weitergegeben, sondern in den eigenen Favoriten gespeichert werden. ' +
    'In deinem E-Mail-Postfach solltest du eine E-Mail mit diesem Link und einem Bestätigungslink (zur Freischaltung des Nachrichtenversands) erhalten haben.',
  administration_link_open: 'Zur Administration',

  error_required_meal_label: 'Alle Speisen müssen benamt sein.',
  error_required_meal_time: 'Zu jeder Speise muss eine Uhrzeit angegeben werden.',
  error_invalid_meal_time: 'Die Uhrzeiten der Speisen dürfen nicht an Tagen vor dem Event sein.',
  error_invalid_meal_size: 'Momentan werden nur Events mit 2 oder 3 Speisen unterstützt.',

  team_distribution_help:
    'Wenn aktiviert, wird automatisch versucht die Teams jeweils mit Teilnehmern die nicht genügend Platz haben und mit Teilnehmern die genügend Platz haben zu mischen',

  team_size: 'Teamgröße',

  team_distribution_force_equl_hosting: 'Möglichst ausgewogene Teamzusammensetzung anhand der Gastgeber-Kapazitäten',

  gender_aspects: 'Geschlechter-Verteilung',
  gender_aspects_help: 'Nur möglich wenn Geschlecht der Teilnehmer bekannt ist',

  meals_help: 'Du kannst die Namen der Speisen verändern bzw. neue hinzufügen oder vorhandene entfernen. Es müssen jedoch immer mind. 2 Speisen vorhanden sein.',

  time_setup: 'Uhrzeiten festlegen',

  participants_preview: 'Teilnehmer Vorschau',
  participants_preview_text:
    'Mit den aktuellen Einstellungen benötigst du <strong>mindestens</strong>\n' + '<strong>{{ numParticipants }}</strong> Teilnehmer, damit du dein Dinner durchführen kannst.',
  participants_preview_demo_text:
    'Bei Erstellung des Demo Dinner Events werden dir automatisch <strong>18</strong> Demo Teilnehmer angelegt, so dass du direkt und einfach alle\n' +
    '      Funktionalitäten testen kannst. Du kannst selbstverständlich auch eigene neue Teilnehmer zu Testzwecken anlegen.',

  almost_there: 'Fast geschafft...',

  administration_email_label: 'Deine E-Mail Adresse',

  adv_headline: 'Zustimmung zur Auftragsdatenverarbeitung',
  adv_text_question: 'Warum muss ich dies tun?',
  adv_text_answer: 'Ab dem 25. Mai 2018 gilt die neue Datenschutz-Grundverordnung (DSGVO) zur Verarbeitung personenbezogener Daten.',
  adv_text_help:
    'Da du als Eventveranstalter für die personenbezogenen Daten der Teilnehmer im datenschutzrechtlichen Sinne verantwortlich bist, ' +
    'und wir nicht ausschließen können,\n' +
    'dass du die Daten ausschließlich zur Ausübung persönlicher oder familiärer Tätigkeiten verarbeitest,\n' +
    'soll die <anchor href="/resources/AV-Vereinbarung.pdf" title="Vereinbarung zur Auftragsdatenverarbeitung" /> uns beide rechtlich absichern.',
  adv_text_address_help:
    'Hierzu müssen wir auch deine persönliche Anschrift abfragen.<br>\n' +
    '<strong>Wichtig: Wir veröffentlichen deine Daten nicht und verwenden Sie ausschließlich für die Erbringung unserer Dienstleistung.</strong>',

  finish: 'Fertigstellen!',
  done: '... Geschafft!',
  administration_link: 'Link zur Administration',

  wizard_step_basics: 'Einstellungen',
  wizard_step_options: 'Details',
  wizard_step_mealtimes: 'Uhrzeiten',
  wizard_step_public_registration: 'Registrierung',
  wizard_step_participant_preview: 'Teilnehmer',
  wizard_step_finish: 'Fertig',

  wizard_demo_mode_text:
    'Demo-Modus: Alle Einstellungen sind vorbelegt, können aber auch geändert werden.' +
    '<br /><strong>Hinweis:</strong> Öffentliche Dinner werden im Demo-Modus nicht veröffentlicht.',

  wizard_create_title: 'Erstellung eines eigenen Running Dinner',
};

export default Wizard_de;
