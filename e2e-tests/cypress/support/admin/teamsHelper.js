import {getByTestId, navigateTeamsList} from "../index";

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