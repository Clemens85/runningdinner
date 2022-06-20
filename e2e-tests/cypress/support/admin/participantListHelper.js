import {getByTestId, submitStandardDialog} from "../index";

export function assertParticipantListLength(expectedLength) {
  return getParticipantRows()
          .should("have.length", expectedLength);
}

export function assertWaitingListParticipantsLength(expectedLength) {
  getByTestId("waitinglist-participants").within(() => {
    assertParticipantListLength(expectedLength);
  });
}

export function selectParticipantOnWaitingList(index) {
  getByTestId("waitinglist-participants").within(() => {
    getParticipantRows()
      .eq(index)
      .click({ force: true });
  });
}

export function openDeleteParticipantDialog() {
  getByTestId("delete-participant-dialog-action")
    .click({ force: true});
}

export function openDeleteParticipantDialogAndSubmit() {
  openDeleteParticipantDialog();
  getByTestId("delete-participant-dialog").within(() => {
    submitStandardDialog();
  });
}

export function assertParticipantListInfoWithText(expectedTextToBeContained) {
  return getByTestId("participant-list-info-box")
          .should("contain", expectedTextToBeContained);
}

export function getParticipantRows() {
  return getByTestId("participant-row");
}