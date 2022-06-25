import {assertMuiCheckboxSelected, assertToastIsShown, getByTestId} from "../index";

export function getOpenWaitingListButton() {
  return getByTestId("open-waitinglist-view-action");
}

export function closeWaitingList() {
  getByTestId("close-waitinglist-view-action")
    .click({ force: true});
  assertWaitingListClosed();
}

export function assertWaitingListClosed() {
  getByTestId("close-waitinglist-view-action")
    .should("not.exist");
}

export function assertNoParticipantsSelectedMessage() {
  assertToastIsShown("Bitte wähle Teilnehmer aus mit denen du die Teams auffüllen möchtest");
}

export function assertParticipantsAssignedToTeamsSuccessMessage() {
  assertToastIsShown("Teams durch ausgewählte Teilnehmer aufgefüllt");
}

export function selectParticipantForTeamAssignment(teamIndex, participantIndexForTeam) {
  getByTestId("waitinglist-team-for-assignment")
    .eq(teamIndex)
    .within(() => {
      getByTestId("waitinglist-participant-for-assignment")
        .eq(participantIndexForTeam)
        .click({ force: true });
    });
}

export function assertWaitingListDistributeToTeamsView(expectedNumParticipantsLeft) {
  getByTestId("waitinglist-distribute-to-teams-view")
    .should("exist")
    .should("contain", `Die ${expectedNumParticipantsLeft} verbleibenden Teilnehmer auf der Warteliste können nicht als neue Teams hinzugefügt werden`);
}

export function assertWaitingListTeamsParticipantsAssignmentView(expectedNumParticipantsCanBeAssigned) {
  getByTestId("waitinglist-teams-participants-assignment-view")
    .should("exist")
    .should("contain", `Hierfür kannst du insgesamt ${expectedNumParticipantsCanBeAssigned} Teilnehmer verwenden`);
}

export function submitWaitingListTeamsParticipansAssignmentView() {
  getByTestId("waitinglist-assign-participants-teams-action")
    .click();
}


export function assertWaitingListTeamGenerationView(expectedNumParticipantsCanBeGenerated) {
  getByTestId("waitinglist-teams-generation-view")
    .should("exist")
    .should("contain", `Es gibt ${expectedNumParticipantsCanBeGenerated} Teilnehmer welche als neue Teams eingeteilt werden können`);
}

export function assertWaitingListTeamGenerationViewRemainingParticipantsHint(expectedNumParticipantsRemaining, expectedNumParticipantsMissing) {
  getByTestId("waitinglist-teams-generation-view")
    .should("exist")
    .should("contain", `${expectedNumParticipantsRemaining} Teilnehmer welche übrig bleiben`)
    .should("contain", `${expectedNumParticipantsMissing} weitere Teilnehmer anmelden`);
}

export function assertNoWaitingListTeamGenerationViewRemainingParticipantsHint() {
  getByTestId("waitinglist-teams-generation-view-remaining-participants-hint")
    .should("not.exist");
}

export function assertFirstParticipantsAreSelected(numSelectedParticipants) {
  for (let i = 0; i < numSelectedParticipants; i++) {
    assertMuiCheckboxSelected(getWaitingListParticipantForTeamGeneration(i), true);
  }
}

export function getWaitingListParticipantForTeamGeneration(index) {
  return getByTestId("waitinglist-participant-for-teams-generation")
          .eq(index);
}

export function getWaitinglistGenerateTeamsAction() {
  return getByTestId("waitinglist-teams-generation-action");
}

export function assertWaitingListTeamsGeneratedSuccessMessage() {
  assertToastIsShown("Neue Teams erfolgreich generiert");
}

export function assertWaitingListNotificationDinnerRouteHint(expectedToBeShown) {
  const shouldChainer = expectedToBeShown ? "exist": "not.exist";
  return getByTestId("waitinglist_notification_dinnerroute_hint")
          .should(shouldChainer);
}

export function submitWaitinglistTeamsNotificationWithoutOpeningMessages() {
  getByTestId("waitinglist_notification_teams_continue_without_messages_action")
    .click();
}

export function submitWaitinglistTeamsNotificationWithOpeningMessages() {
  getByTestId("waitinglist_notification_teams_open_messages_action")
    .invoke('removeAttr', 'target')
    .click();
}

export function assertWaitingListNotificationTeams(numExpectedTeams) {
  return getByTestId("waitinglist_notification_team")
          .should("have.length", numExpectedTeams);
}