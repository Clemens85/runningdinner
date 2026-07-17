import { getByTestId } from '../index';

const PORTAL_TOKENS_STORAGE_KEY = 'runningdinner_portal_tokens';
const PORTAL_MY_EVENTS_URL = '/my-events';

/**
 * Registers a participant via the admin API (which auto-activates them),
 * then calls the public activation endpoint to obtain a portal token,
 * then resolves selfAdminId from the portal my-events API
 * (mirrors what the frontend does — selfAdministrationId is not in the wizard response).
 *
 * @param {string} adminId        - The adminId of the running dinner
 * @param {string} publicDinnerId - The publicDinnerId of the running dinner
 * @param {object} participantJson - Participant data (must include email)
 * @returns Cypress chain resolving to { portalToken, participantId, selfAdminId }
 */
export function createParticipantAndObtainPortalToken(adminId, publicDinnerId, participantJson) {
  return cy
    .request({
      method: 'POST',
      url: `/rest/participantservice/v1/runningdinner/${adminId}/participant`,
      body: participantJson,
    })
    .then((createResp) => {
      const participantId = createResp.body.id;
      const email = participantJson.email;

      return cy
        .request({
          method: 'PUT',
          url: `/rest/frontend/v1/runningdinner/${publicDinnerId}/${participantId}/activate?email=${encodeURIComponent(email)}`,
          headers: { 'Content-Type': 'application/json' },
          body: {},
        })
        .then((activationResp) => {
          const portalToken = activationResp.body.portalToken;
          console.log(`Portal token obtained for ${email}: ${portalToken}`);

          // Resolve selfAdminId via my-events API — selfAdministrationId is not exposed in the wizard response
          return cy
            .request({
              method: 'POST',
              url: '/rest/participant-portal/v1/my-events',
              body: { portalTokens: [portalToken] },
            })
            .then((myEventsResp) => {
              const participantCredential = myEventsResp.body.events?.[0]?.credentials?.PARTICIPANT;
              const selfAdminId = participantCredential?.selfAdminId;
              return { portalToken, participantId, selfAdminId };
            });
        });
    });
}

/**
 * Navigates to the "My Events" portal page with the given portal token
 * pre-seeded in localStorage, simulating what the activation email link does.
 *
 * @param {string} portalToken
 */
export function navigateMyEventsPageWithPortalToken(portalToken) {
  cy.visit(PORTAL_MY_EVENTS_URL, {
    onBeforeLoad(win) {
      win.localStorage.setItem(PORTAL_TOKENS_STORAGE_KEY, JSON.stringify([portalToken]));
    },
  });
}

/**
 * Returns all portal event cards currently visible on the My Events page.
 */
export function getPortalEventCards() {
  return getByTestId('portal-event-card');
}

/**
 * Returns the first portal event card (most common case in tests with one event).
 */
export function getFirstPortalEventCard() {
  return getPortalEventCards().first();
}

/**
 * Asserts that exactly the given number of event cards is rendered.
 */
export function assertPortalEventCardCount(expectedCount) {
  getPortalEventCards().should('have.length', expectedCount);
}

/**
 * Within the first event card, asserts the event name is visible.
 */
export function assertPortalEventCardShowsEventName(expectedName) {
  getFirstPortalEventCard().within(() => {
    getByTestId('portal-event-name').should('contain.text', expectedName);
  });
}

/**
 * Within the first event card, asserts the role chip label is visible.
 */
export function assertPortalEventCardShowsRole(roleLabel) {
  getFirstPortalEventCard().contains(roleLabel).should('exist');
}

/**
 * Clicks the "Meine Teilnahme" (view participation) button on the first event card.
 */
export function clickViewParticipationButton() {
  getFirstPortalEventCard().within(() => {
    getByTestId('portal-view-participation-btn').click();
  });
}

export function assertFirstUsageInfoShown() {
  getByTestId('portal-first-usage-info').should('exist');
}

// ─── Participant Self-Service Page ────────────────────────────────────────────

/**
 * Navigates directly to the participant self-service page with the portal token
 * pre-seeded in localStorage.
 *
 * @param {string} selfAdminId  - RunningDinner.selfAdministrationId
 * @param {string} participantId
 * @param {string} portalToken
 */
export function navigateParticipantSelfServicePage(selfAdminId, participantId, portalToken) {
  cy.visit(`${PORTAL_MY_EVENTS_URL}/event/${selfAdminId}/${participantId}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem(PORTAL_TOKENS_STORAGE_KEY, JSON.stringify([portalToken]));
    },
  });
}

/**
 * Generates teams for a dinner via the admin REST API.
 */
export function generateTeamsViaApi(adminId) {
  return cy.request({
    method: 'POST',
    url: `/rest/teamservice/v1/runningdinner/${adminId}`,
  });
}

// ─── Team section assertions ─────────────────────────────────────────────────

export function assertTeamSectionShowsPendingState() {
  getByTestId('portal-team-pending').should('exist');
}

export function assertTeamSectionShowsTeamDetails() {
  getByTestId('portal-team-details').should('exist');
  getByTestId('portal-meal-chip').should('exist');
}

/**
 * Asserts that a chip with the given label (e.g. "Vegetarisch") is visible
 * inside the team section.
 */
export function assertTeamSectionContainsText(text) {
  getByTestId('portal-team-section').contains(text).should('exist');
}

// ─── Dinner route section assertions ─────────────────────────────────────────

export function assertDinnerRouteSectionShowsPendingState() {
  getByTestId('portal-dinnerroute-pending').should('exist');
}

// ─── Messages section assertions ─────────────────────────────────────────────

export function assertMessagesSectionShowsEmptyState() {
  getByTestId('portal-messages-empty').should('exist');
}

/**
 * Asserts that at least one message item exists in the messages list and that
 * the given subject text is visible.
 */
export function assertMessagesSectionContainsSubject(subject) {
  getByTestId('portal-message-item').should('exist');
  getByTestId('portal-messages-section').contains(subject).should('exist');
}
