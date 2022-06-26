import {
  assertMuiCheckboxByTestId, getButtonByLabel,
  getByTestId,
  navigateAdminDashboard,
  navigateTeamsList,
  submitStandardDialog
} from "../index";

export function generateTeams(adminId, postFunctionToExecute) {
  navigateTeamsList(adminId);
  getByTestId("generate-teams-action").click({ force: true});
  getByTestId("team-row").should("exist");
  if (postFunctionToExecute) {
    postFunctionToExecute();
  }
}

export function getTeamAt(index) {
  return getByTestId("team-row")
          .eq(index);
}

export function assertTeamCancelOverviewDialog(funcToExecute) {
  return getByTestId("team-cancel-dialog-overview").within(funcToExecute);
}

export function assertTeamCancelPreviewDialog(funcToExecute) {
  return getByTestId("team-cancel-dialog-preview").within(funcToExecute);
}

export function generateTeamsAndRefresh(adminId) {
  generateTeams(adminId, () => {
    navigateAdminDashboard(adminId);
    cy.wait(50);
    navigateTeamsList(adminId);
  });
}

export function cancelTeamAtIndex(adminId, index, numParticipantsToDeselect) {
  navigateTeamsList(adminId);

  getTeamAt(index).click({ force: true});

  getByTestId("team-details-context-menu-icon").click();
  getByTestId("context-menu-entry-Absage des Teams...").click();

  assertTeamCancelOverviewDialog(() => {
    cy.log("Assert the first two recipients are pre-selected as proposal, and de-select them so that team gets not replaced");
    for (let i = 0; i < numParticipantsToDeselect; i++) {
      assertMuiCheckboxByTestId(`replacement-participant-${i}`, true)
        .click();
    }
    submitStandardDialog();
  });

  assertTeamCancelPreviewDialog(() => {
    cy.log("Assert team cancel preview is shown");
    submitStandardDialog();
  });

  cy.log("Assert complete team-cancel dialog is closed");
  getTeamAt(index).should("be.visible");
}