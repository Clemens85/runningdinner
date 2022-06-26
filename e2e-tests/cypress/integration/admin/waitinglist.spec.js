/// <reference types="cypress" />

import {
  acknowledgeRunningDinner,
  assertDashboardAdminActivityContains,
  assertFirstParticipantsAreSelected,
  assertMuiCheckboxSelected,
  assertNotEnoughWaitingListParticipantsSelectedForTeamGenerationMessage,
  assertNoWaitingListTeamGenerationViewRemainingParticipantsHint,
  assertParticipantListInfoWithText,
  assertParticipantListLength,
  assertTooMuchWaitingListParticipantsSelectedForTeamGenerationMessage,
  assertWaitingListDistributeToTeamsView,
  assertWaitingListNotificationDinnerRouteHint,
  assertWaitingListNotificationTeams,
  assertWaitingListParticipantsLength,
  assertWaitingListTeamGenerationView,
  assertWaitingListTeamGenerationViewRemainingParticipantsHint,
  assertWaitingListTeamsGeneratedSuccessMessage,
  assertWaitingListTeamsNotGeneratedView,
  assertWaitingListTeamsParticipantsAssignmentView, assertWaitingListTooMuchParticipantsSelectedForAssignmentMessage,
  cancelTeamAtIndex,
  generateTeamsAndRefresh,
  getWaitinglistGenerateTeamsAction,
  getWaitingListParticipantForTeamGeneration,
  navigateAdminDashboard,
  navigateParticipantsList,
  openDeleteParticipantDialogAndSubmit,
  selectParticipantOnWaitingList,
  sendTeamMessagesToAllTeams,
  submitWaitinglistTeamsNotificationWithOpeningMessages,
  submitWaitinglistTeamsNotificationWithoutOpeningMessages,
  submitWaitingListTeamsParticipansAssignmentView,
} from "../../support";
import { createRunningDinner } from "../../support/runningDinnerSetup"
import {
  assertNoParticipantsSelectedMessage, assertParticipantsAssignedToTeamsSuccessMessage,
  closeWaitingList,
  getOpenWaitingListButton, selectParticipantForTeamAssignment
} from "../../support";
import {createParticipants} from "../../support/participantSetup";

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
    cancelTeamAtIndex(adminId, 0, 2);
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

    cy.log("Assert dashboard contains activity for waitinglist participant assignment");
    navigateAdminDashboard(adminId);
    assertDashboardAdminActivityContains(0, "Du hast 1 Team mit Teilnehmern von der Warteliste aufgefüllt");

    // *********************************** //
    navigateParticipantsList(adminId);

    cy.log("Cancel second team and navigate back to participant list");
    cancelTeamAtIndex(adminId, 1, 2);
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

    cy.log("Delete the two remaining participants on waitinglist and verify that waitinglist action is no longer visible");
    selectParticipantOnWaitingList(0);
    openDeleteParticipantDialogAndSubmit();
    cy.wait(500);
    assertWaitingListParticipantsLength(1);  // Only one left now

    selectParticipantOnWaitingList(0); // Delete last participant on waitinglist
    openDeleteParticipantDialogAndSubmit();
    getOpenWaitingListButton()
      .should("not.exist");
    assertParticipantListInfoWithText("Warteliste leer");
  })

  it('waitinglist dialog shows generate teams view when enough participants on waitinglist', () => {

    generateTeamsAndRefresh(adminId);

    createParticipants(adminId, 24, 24);

    navigateParticipantsList(adminId);

    getOpenWaitingListButton().click({ force: true });
    assertWaitingListTeamGenerationView(6);
    assertNoWaitingListTeamGenerationViewRemainingParticipantsHint();

    cy.log("Assert all 6 participants selected and deselection causes error when submitting");
    assertFirstParticipantsAreSelected(6);
    getWaitingListParticipantForTeamGeneration(0)
      .click({ force: true });
    getWaitinglistGenerateTeamsAction().click({ force: true});
    cy.log("Assert we are still on this view with only 5 selected participants");
    assertNotEnoughWaitingListParticipantsSelectedForTeamGenerationMessage();
    assertWaitingListTeamGenerationView(6);

    cy.log("Select first participant again");
    getWaitingListParticipantForTeamGeneration(0)
      .click({ force: true });
    assertFirstParticipantsAreSelected(6);

    cy.log("Generate teams should close dialog and show updated participant list");
    getWaitinglistGenerateTeamsAction().click({ force: true});
    assertWaitingListTeamsGeneratedSuccessMessage();
    getOpenWaitingListButton()
      .should("not.exist");
    assertParticipantListInfoWithText("Warteliste leer");
  })

  it('waitinglist dialog shows generate teams view with remaining participants', () => {

    generateTeamsAndRefresh(adminId);

    cy.log("Generate 3 new participants, giving us in total 26 participants")
    createParticipants(adminId, 24, 26);

    navigateParticipantsList(adminId);

    getOpenWaitingListButton().click({ force: true });
    assertWaitingListTeamGenerationViewRemainingParticipantsHint(2, 4);

    cy.log("Assert first 6 participants being selected and the remaining two ones de-selected");
    assertFirstParticipantsAreSelected(6);
    assertMuiCheckboxSelected(getWaitingListParticipantForTeamGeneration(6), false); // 7th participant
    assertMuiCheckboxSelected(getWaitingListParticipantForTeamGeneration(7), false); // 8th participant

    cy.log("Generate new teams and assert waitinglist still contains participants");
    getWaitinglistGenerateTeamsAction().click({ force: true});
    assertWaitingListTeamsGeneratedSuccessMessage();
    assertWaitingListDistributeToTeamsView(2);
    closeWaitingList();
    getOpenWaitingListButton().should("exist");
    assertWaitingListParticipantsLength(2);

  })

  it('waitinglist dialog can handle multiple teams to be generated', () => {

    generateTeamsAndRefresh(adminId);

    cy.log("Generate 7 new participants, giving us in total 12 participants on waitinglist")
    createParticipants(adminId, 24, 30);

    navigateParticipantsList(adminId);

    getOpenWaitingListButton().click({ force: true });
    assertWaitingListTeamGenerationView(12);
    assertNoWaitingListTeamGenerationViewRemainingParticipantsHint();

    cy.log("Assert first 6 participants being selected and the remaining two ones de-selected");
    assertFirstParticipantsAreSelected(12);

    cy.log("Generate new teams and assert dialog is closed and waitinglist still contains participants");
    getWaitinglistGenerateTeamsAction().click({ force: true});
    assertWaitingListTeamsGeneratedSuccessMessage();
    getOpenWaitingListButton().should("not.exist");

    cy.log("Assert dashboard contains activity for waitinglist temas generation");
    navigateAdminDashboard(adminId);
    // 15 teams due to all teams were completly new generated (due to no team-messages had been sent)
    assertDashboardAdminActivityContains(0, "Du hast 15 neue Teams von der Warteliste generiert");
  })

  it('waitinglist dialog shows notification view when team messages are already sent', () => {

    generateTeamsAndRefresh(adminId);

    acknowledgeRunningDinner(adminId);

    cy.log("Generate 3 new participants, giving us in total 8 participants on waitinglist")
    createParticipants(adminId, 24, 26);

    cy.log("Send Team Arrangement Messages so that we can test notification view");
    sendTeamMessagesToAllTeams(adminId);
    cy.wait(500);

    cy.log("Cancel first team and navigate back to participant list");
    cancelTeamAtIndex(adminId, 0, 2);
    navigateParticipantsList(adminId);

    getOpenWaitingListButton().click({ force: true });
    cy.log("Assign 2 participants to cancelled teams");
    assertWaitingListTeamsParticipantsAssignmentView(2);
    selectParticipantForTeamAssignment(0,0);
    selectParticipantForTeamAssignment(0,1);
    submitWaitingListTeamsParticipansAssignmentView();
    assertParticipantsAssignedToTeamsSuccessMessage();

    cy.log("Assert notification view is shown after participants assignment");
    assertWaitingListNotificationDinnerRouteHint(false);
    assertWaitingListNotificationTeams(1);
    submitWaitinglistTeamsNotificationWithoutOpeningMessages();

    cy.log("Generate teams view is shown");
    assertWaitingListTeamGenerationView(6);
    assertNoWaitingListTeamGenerationViewRemainingParticipantsHint();
    assertFirstParticipantsAreSelected(6);
    getWaitinglistGenerateTeamsAction().click({ force: true});

    cy.log("Assert notification view is shown after team generation");
    assertWaitingListNotificationDinnerRouteHint(false);
    assertWaitingListNotificationTeams(3);
    submitWaitinglistTeamsNotificationWithOpeningMessages();
  })

  it('waitinglist dialog shows team generation hint when teams not yet generated', () => {
    navigateParticipantsList(adminId);
    getOpenWaitingListButton().click({ force: true });
    assertWaitingListTeamsNotGeneratedView();
    closeWaitingList();
    getOpenWaitingListButton().should("exist");
  })

  it('waitinglist dialog handles validations properly', () => {
    generateTeamsAndRefresh(adminId);

    createParticipants(adminId, 24, 25); // We have now 7 participants on waitinglsit

    navigateParticipantsList(adminId);

    getOpenWaitingListButton().click({ force: true });
    assertWaitingListTeamGenerationView(6);
    assertWaitingListTeamGenerationViewRemainingParticipantsHint(1, 5);

    cy.log("Try to select also 7th participant");
    assertFirstParticipantsAreSelected(6);
    getWaitingListParticipantForTeamGeneration(6)
      .click({ force: true });
    assertFirstParticipantsAreSelected(6);
    assertTooMuchWaitingListParticipantsSelectedForTeamGenerationMessage();
    closeWaitingList();

    cy.log("Cancel first team and navigate back to participant list");
    cancelTeamAtIndex(adminId, 0, 2);
    navigateParticipantsList(adminId);

    cy.log("Expected 2 participants to be assignable in total in teams participants assignment view");
    getOpenWaitingListButton().click({ force: true });
    assertWaitingListTeamsParticipantsAssignmentView(2);
    cy.log("Assert validation message is shown when too much participants are selected");

    selectParticipantForTeamAssignment(0,0);
    selectParticipantForTeamAssignment(0,1);
    selectParticipantForTeamAssignment(0,2);
    assertWaitingListTooMuchParticipantsSelectedForAssignmentMessage();
    cy.log("Submit participants assignment. If this works, the validation before also worked")
    submitWaitingListTeamsParticipansAssignmentView();

    cy.log("Expected the 5 participants to be shown as remaining participants on waitinglist");
    assertWaitingListDistributeToTeamsView(5);
    closeWaitingList();
  })

})
