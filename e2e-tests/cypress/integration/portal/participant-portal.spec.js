/// <reference types="cypress" />

import { createRunningDinner } from '../../support/runningDinnerSetup';
import { newParticipantJson, createParticipants } from '../../support/participantSetup';
import {
  assertPortalEventCardCount,
  assertPortalEventCardShowsEventName,
  assertPortalEventCardShowsRole,
  assertFirstUsageInfoShown,
  assertTeamSectionShowsPendingState,
  assertDinnerRouteSectionShowsPendingState,
  assertMessagesSectionShowsEmptyState,
  assertTeamSectionShowsTeamDetails,
  assertTeamSectionContainsText,
  assertMessagesSectionContainsSubject,
  createParticipantAndObtainPortalToken,
  generateTeamsViaApi,
  navigateMyEventsPageWithPortalToken,
  navigateParticipantSelfServicePage,
} from '../../support';
import { acknowledgeRunningDinner, sendTeamMessagesToAllTeams } from '../../support/admin/messagesHelper';

describe('participant portal', () => {
  let adminId, publicDinnerId;

  beforeEach(() => {
    createRunningDinner({ date: new Date(), registrationType: 'PUBLIC', numParticipantsToCreate: 0 }).then((response) => {
      adminId = response.runningDinner.adminId;
      publicDinnerId = response.runningDinner.publicSettings.publicDinnerId;
    });
  });

  it('shows first usage info when My Events page is opened without a portal token', () => {
    cy.visit('/my-events');
    assertFirstUsageInfoShown();
  });

  it('participant can access portal and sees event card after registration', () => {
    const uniqueSuffix = crypto.randomUUID().substring(0, 8);
    const participantJson = newParticipantJson(1, { email: `portal-test-${uniqueSuffix}@test.de` });

    createParticipantAndObtainPortalToken(adminId, publicDinnerId, participantJson).then(({ portalToken }) => {
      navigateMyEventsPageWithPortalToken(portalToken);

      assertPortalEventCardCount(1);
      assertPortalEventCardShowsEventName('E2E Test Public Title');
      assertPortalEventCardShowsRole('Teilnehmer:in');
    });
  });

  it('self-service page shows empty state when participant is not yet assigned to a team', () => {
    const uniqueSuffix = crypto.randomUUID().substring(0, 8);
    const participantJson = newParticipantJson(1, { email: `portal-test-${uniqueSuffix}@test.de` });

    createParticipantAndObtainPortalToken(adminId, publicDinnerId, participantJson).then(({ portalToken, participantId, selfAdminId }) => {
      navigateParticipantSelfServicePage(selfAdminId, participantId, portalToken);

      assertTeamSectionShowsPendingState();
      assertDinnerRouteSectionShowsPendingState();
      assertMessagesSectionShowsEmptyState();
    });
  });

  it('self-service page shows team data and message after organizer sends team arrangement', () => {
    const uniqueSuffix = crypto.randomUUID().substring(0, 8);
    // All 18 participants are vegetarian (default) so the team partner meal specifics chip is predictable
    const testParticipantJson = newParticipantJson(18, { email: `portal-test-${uniqueSuffix}@test.de` });

    createParticipants(adminId, 1, 17);
    createParticipantAndObtainPortalToken(adminId, publicDinnerId, testParticipantJson).then(({ portalToken, participantId, selfAdminId }) => {
      generateTeamsViaApi(adminId);
      acknowledgeRunningDinner(adminId);
      sendTeamMessagesToAllTeams(adminId);

      navigateParticipantSelfServicePage(selfAdminId, participantId, portalToken);

      assertTeamSectionShowsTeamDetails();
      assertTeamSectionContainsText('Vegetarisch');
      assertMessagesSectionContainsSubject('Subject');
    });
  });
});
