(function(angular) {
  'use strict';

  angular.module('rd.self.constants').constant('SelfAdminMessages_lang_de', {

    change_team_host_title: 'Gastgeber verwalten',
    change_team_host_help: 'Hier hast du die Möglichkeit dich oder deine(n) Team-Partner als neuen Gastgeber einzutragen. ' +
                           'Die Änderung wird sofort aktiv nachdem du sie gespeichert hast.',

    change_team_host_comment: 'Persönliche Bemerkungen',
    change_team_host_comment_help: 'Dein Teampartner erhält eine automatische Benachrichtung wenn du den Gastgeber änderst. Hier kannst du noch eine persönliche Nachricht hinterlassen:',

    change_team_host_loading_error_text: 'Die Daten zur Gastgeber-Verwaltung konnten nicht geladen werden. Bitte überprüfe die URL und versuche es ggfalls. später erneut.',
    change_team_host_loading_error_title: 'Fehler beim Laden der Daten',

    change_team_host_success_text: 'Neuer Gastgeber ist jetzt <strong>{{ newTeamHost }}</strong>.<br> Es wurden Benachrichtigungen an alle Team-Mitglieder versandt.',

    change_team_host_button: 'Als neuen Gastgeber speichern',

    manage_teampartner_wish_title: 'Wunschpartner verwalten',
    manage_teampartner_wish_help: 'Hier kannst du deinen Wunschpartner (nachträglich) bestätigen oder ändern.',
    manage_teampartner_wish_success: 'Änderung deines Wunschpartners erfolgreich gespeichert!',

    team_partner_wish_update_invalid: 'Änderung deines Wunschpartners konnte nicht durchgeführt werden. ' +
                                      'Das kann z.B. daran liegen, dass dein Wunschpartner nicht angemeldet ist oder dass die Team-Einteilungen bereits vorgenommen wurden.',

    team_partner_wish_manage_title: 'Run Your Dinner - Wunschpartner verwalten',
    host_manage_title: 'Run Your Dinner - Gastgeber verwalten',

    x: 'x'
  });

})(angular);
