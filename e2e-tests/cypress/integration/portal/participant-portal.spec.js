/// <reference types="cypress" />

import { createRunningDinner } from '../../support/runningDinnerSetup';
import { newParticipantJson } from '../../support/participantSetup';
import {
  assertPortalEventCardCount,
  assertPortalEventCardShowsEventName,
  assertPortalEventCardShowsRole,
  createParticipantAndObtainPortalToken,
  navigateMyEventsPageWithPortalToken,
} from '../../support';

describe('participant portal', () => {
  let adminId, publicDinnerId;

  beforeEach(() => {
    createRunningDinner({ date: new Date(), registrationType: 'PUBLIC', numParticipantsToCreate: 0 }).then((response) => {
      adminId = response.runningDinner.adminId;
      publicDinnerId = response.runningDinner.publicSettings.publicDinnerId;
    });
  });

  it('participant can access portal and sees event card after registration', () => {
    const uniqueSuffix = crypto.randomUUID().substring(0, 8);
    const participantJson = newParticipantJson(1, { email: `portal-test-${uniqueSuffix}@test.de` });

    createParticipantAndObtainPortalToken(adminId, publicDinnerId, participantJson).then((portalToken) => {
      navigateMyEventsPageWithPortalToken(portalToken);

      assertPortalEventCardCount(1);
      assertPortalEventCardShowsEventName('E2E Test Public Title');
      assertPortalEventCardShowsRole('Teilnehmer:in');
    });
  });
});
