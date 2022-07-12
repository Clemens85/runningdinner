/// <reference types="cypress" />

import {
  getGenerateTeamsButton,
   navigateTeamsList
} from "../../support";
import { createRunningDinner } from "../../support/runningDinnerSetup"
import {createParticipants} from "../../support/participantSetup";

describe('teams view', () => {

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

  it('shows teams can be generated without waitinglist participants', () => {
    createParticipants(adminId, 1, 18);
    navigateTeamsList(adminId);
    cy.contains("Damit würden sich aktuell 9 Teams ergeben. Es gibt 0 Teilnehmer die nicht in Teams eingeteilt werden können");
    cy.contains("Aktuell sind 18 Teilnehmer angemeldet");
    getGenerateTeamsButton().should("be.enabled");
  })

  it('teams not existing view has a disabled button for too few participants', () => {
    createParticipants(adminId, 1, 10);
    navigateTeamsList(adminId);
    getGenerateTeamsButton().should("be.disabled");
    cy.contains("Derzeit reicht die Teilnehmeranzahl leider nicht aus um eine Teameinteilung vorzunehmen");
    cy.contains("Aktuell sind 10 Teilnehmer angemeldet");
  })

  it('shows teams can be generated with waitinglist participants', () => {
    createParticipants(adminId, 1, 20);
    navigateTeamsList(adminId);
    cy.contains("Damit würden sich aktuell 9 Teams ergeben. Es gibt 2 Teilnehmer die nicht in Teams eingeteilt werden können");
    cy.contains("Aktuell sind 20 Teilnehmer angemeldet");
    getGenerateTeamsButton().should("be.enabled");
  })
})
