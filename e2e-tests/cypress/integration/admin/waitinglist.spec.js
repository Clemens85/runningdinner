/// <reference types="cypress" />

import {
  assertParticipantListLength,
  assertWaitingListDistributeToTeamsView,
  assertWaitingListParticipantsLength,
  assertWaitingListTeamsParticipantsAssignmentView,
  cancelTeamAtIndex,
  generateTeamsAndRefresh,
  getByTestId,
  navigateParticipantsList,
  submitWaitingListTeamsParticipansAssignmentView,
} from "../../support";
import { createRunningDinner } from "../../support/runningDinnerSetup"
import {
  assertNoParticipantsSelectedMessage, assertParticipantsAssignedToTeamsSuccessMessage,
  closeWaitingList,
  getOpenWaitingListButton, selectParticipantForTeamAssignment
} from "../../support";

describe('team cancellation', () => {

  let runningDinner, adminId;

  beforeEach(() => {
    createRunningDinner({
      date: new Date(),
      numParticipantsToCreate: 23
    }).then(createRunningDinnerResponse => {
      runningDinner = createRunningDinnerResponse.runningDinner;
      adminId = runningDinner.adminId;
    });
  })

  it('waitinglist dialog shows teams-participants-assignment view for cancelled teams', () => {
    generateTeamsAndRefresh(adminId);

    navigateParticipantsList(adminId);
    assertParticipantListLength(23); // 18 + 5 on waitinglist
    assertWaitingListParticipantsLength(5);

    getOpenWaitingListButton().click({ force: true });

    cy.log("Expected the 5 participants to be shown as remaining participants on waitinglist");
    assertWaitingListDistributeToTeamsView(5);
    closeWaitingList();

    cy.log("Cancel first team and navigate back to participant list");
    cancelTeamAtIndex(adminId, 0);
    navigateParticipantsList(adminId);

    getOpenWaitingListButton().click({ force: true });

    cy.log("Expected 2 participants to be assignable in total in teams participants assignment view");
    assertWaitingListTeamsParticipantsAssignmentView(2);

    cy.log("Assert validation message is shown when no participant is assigned");
    submitWaitingListTeamsParticipansAssignmentView();
    assertNoParticipantsSelectedMessage();

    selectParticipantForTeamAssignment(0,0);
    selectParticipantForTeamAssignment(0,1);
    submitWaitingListTeamsParticipansAssignmentView();
    assertParticipantsAssignedToTeamsSuccessMessage();

    cy.log("Expected the 3 participants to be shown as remaining participants on waitinglist");
    assertWaitingListDistributeToTeamsView(3);
    closeWaitingList();

    assertWaitingListParticipantsLength(5 - 2);  // 2 from waitinglist are now assigned into teams

    // *********************************** //

    cy.log("Cancel second team and navigate back to participant list");
    cancelTeamAtIndex(adminId, 1);
    navigateParticipantsList(adminId);

    getOpenWaitingListButton().click({ force: true });

    cy.log("Expected 2 participants to be assignable in total in teams participants assignment view");
    assertWaitingListTeamsParticipantsAssignmentView(2);

    cy.log("Select only one participant to be assigned into this team, which should work...");
    selectParticipantForTeamAssignment(0,0);
    submitWaitingListTeamsParticipansAssignmentView();
    assertParticipantsAssignedToTeamsSuccessMessage();

    cy.log("... But after successful assignment we should still see the same view, this time with one participant to be assignable");
    assertWaitingListTeamsParticipantsAssignmentView(1);

    closeWaitingList();

    assertWaitingListParticipantsLength(5 - 2 - 1);  // 2 - 1 from waitinglist are now assigned into teams
  })


})
