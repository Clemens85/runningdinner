/// <reference types="cypress" />

import {assertParticipantListLength, navigateParticipantsList} from "../../support";
import { createRunningDinner } from "../../support/runningDinnerSetup"

describe('participants list', () => {

  let runningDinner, adminId;

  beforeEach(() => {
    createRunningDinner({
      date: new Date(),
      numParticipantsToCreate: 18
    }).then(createRunningDinnerResponse => {
      runningDinner = createRunningDinnerResponse.runningDinner;
      adminId = runningDinner.adminId;
    });
  })

  it('displays all created participants', () => {
    navigateParticipantsList(adminId);
    assertParticipantListLength(18);
  })
 
})
