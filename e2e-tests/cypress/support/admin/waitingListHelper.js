import {assertToastIsShown, getByTestId} from "../index";

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