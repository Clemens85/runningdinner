import {getByTestId} from "../index";

export function assertParticipantListLength(expectedLength) {
  return getParticipantRows()
          .should("have.length", expectedLength);
}

export function assertWaitingListParticipantsLength(expectedLength) {
  getByTestId("waitinglist-participants").within(() => {
    assertParticipantListLength(expectedLength);
  });
}

export function getParticipantRows() {
  return getByTestId("participant-row");
}