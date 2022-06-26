/// <reference types="cypress" />

import {
  assertCorrectParticipantNumbers, assertNoParticipantListInfo,
  assertParticipantListInfoWithText,
  assertParticipantListLength,
  assertWaitingListParticipantsLength,
  cancelTeamAtIndex,
  generateTeams,
  generateTeamsAndRefresh,
  getByTestId,
  getOpenWaitingListButton,
  navigateParticipantsList
} from "../../support";
import { createRunningDinner } from "../../support/runningDinnerSetup"
import {createParticipants} from "../../support/participantSetup";

describe('participants list', () => {

  let runningDinner, adminId;

  beforeEach(() => {
    createRunningDinner({
      date: new Date(),
      numParticipantsToCreate: 0
    }).then(createRunningDinnerResponse => {
      runningDinner = createRunningDinnerResponse.runningDinner;
      adminId = runningDinner.adminId;
    });
  })

  it('displays all participants without waitinglist when we have an exact match', () => {
    cy.log("Create in total 18 participants and ensure list is displayed without waitinglit info and success message");
    createParticipants(adminId, 1, 18); // Ensure we have 18 participants
    navigateParticipantsList(adminId);
    assertParticipantListLength(18);
    assertCorrectParticipantNumbers(18);
    getOpenWaitingListButton().should("not.exist");
    assertParticipantListInfoWithText("Warteliste leer");
  })

  it('displays messages for no and too few participants when teams are not generated yet', () => {
    navigateParticipantsList(adminId);
    getByTestId("participant-row").should("not.exist");
    getOpenWaitingListButton().should("not.exist");
    assertParticipantListInfoWithText("Keine Teilnehmer vorhanden");

    createParticipants(adminId, 1, 1); // Ensure we have 1 participant
    navigateParticipantsList(adminId);
    assertParticipantListLength(1);
    assertCorrectParticipantNumbers(1);
    assertParticipantListInfoWithText("Nicht genügend Teilnehmer");
  })

  it('displays waitinglist info message when there is no exact match of participants for teams generation', () => {

    createParticipants(adminId, 1, 20);
    navigateParticipantsList(adminId);
    assertParticipantListLength(20);
    assertWaitingListParticipantsLength(2);
    getOpenWaitingListButton().should("exist");
    assertNoParticipantListInfo();
  })

  it('displays info on top for waiting list participants', () => {

    createParticipants(adminId, 1, 18); // Ensure we have 18 participants
    generateTeamsAndRefresh(adminId);
    createParticipants(adminId, 19, 19); // One participant that is now on waitinglist

    navigateParticipantsList(adminId);
    getOpenWaitingListButton().should("exist");
    assertParticipantListInfoWithText("Warteliste TODO");
    assertWaitingListParticipantsLength(1);
  })


  it.only('waitinglist is displayed when we have < 18 participants, but cancelled team', () => {

    createParticipants(adminId, 1, 18); // Ensure we have 18 participants
    generateTeamsAndRefresh(adminId);
    createParticipants(adminId, 19, 19); // One additional participant on waitinglist

    cancelTeamAtIndex(adminId, 0, 0);

    navigateParticipantsList(adminId);
    getOpenWaitingListButton().should("exist");
    // assertParticipantListInfoWithText("Warteliste TODO"); // TODO

    assertParticipantListLength(17);
    assertWaitingListParticipantsLength(1);

    cy.log("Expect numbering of 1 ... 17");
    assertCorrectParticipantNumbers(17);
  })


})
