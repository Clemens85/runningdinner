/// <reference types="cypress" />

import {
  generateTeams,
  getByTestId, getTeamAt,
  navigateAdminDashboard,
  navigateParticipantsList,
  navigateTeamsList
} from "../../support";
import { createRunningDinner } from "../../support/runningDinnerSetup"

describe('participants list', () => {

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

  it('displays all created participants', () => {

    generateTeams(adminId, () => {
      navigateAdminDashboard(adminId);
      cy.wait(50);
      navigateTeamsList(adminId);
    });

    getByTestId("team-row").should("have.length", 9);

    getTeamAt(0).click({ force: true});



  })

})
