import { getByTestId } from '../index';

const PORTAL_TOKENS_STORAGE_KEY = 'runningdinner_portal_tokens';
const PORTAL_MY_EVENTS_URL = '/my-events';

/**
 * Registers a participant via the admin API (which auto-activates them),
 * then calls the public activation endpoint to obtain a portal token.
 *
 * @param {string} adminId        - The adminId of the running dinner
 * @param {string} publicDinnerId - The publicDinnerId of the running dinner
 * @param {object} participantJson - Participant data (must include email)
 * @returns Cypress chain that resolves to the portal token string
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
          return portalToken;
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
