/// <reference types="cypress" />

import {
  assertTeamCancelOverviewDialog,
  generateTeams, generateTeamsAndRefresh,
  getByTestId, getTeamAt,
  navigateAdminDashboard,
  navigateTeamsList
} from "../../support";
import { createRunningDinner } from "../../support/runningDinnerSetup"

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

  it('can cancel complete team', () => {

    generateTeamsAndRefresh(adminId);

    getByTestId("team-row").should("have.length", 9);

    getTeamAt(0).click({ force: true});

    getByTestId("team-details-context-menu-icon").click();
    getByTestId("context-menu-entry-Absage des Teams...").click();

    assertTeamCancelOverviewDialog(() => {
      // TODO
    });
  })

})
